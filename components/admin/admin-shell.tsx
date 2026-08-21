"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Table2,
  Tags,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AdminLiveAlerts } from "@/components/admin/admin-live-alerts";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Sipariş", icon: ClipboardList },
  { href: "/admin/tables", label: "Masalar", icon: Table2 },
  { href: "/admin/qr", label: "QR", icon: QrCode },
  { href: "/admin/menu", label: "Menü", icon: UtensilsCrossed },
] as const;

const SECONDARY = [
  { href: "/admin/categories", label: "Kategoriler", icon: Tags },
  { href: "/admin/reservations", label: "Rezervasyon", icon: CalendarDays },
  { href: "/admin/requests", label: "Garson", icon: Bell },
  { href: "/admin/history", label: "Geçmiş", icon: History },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useBodyScrollLock(drawerOpen);

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background-deep lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="print-hidden hidden border-r border-gold/15 lg:block">
        <div className="flex items-center gap-3 px-4 py-4">
          <BrandLogo href="/admin" size={48} />
          <span className="text-xs uppercase tracking-[0.18em] text-gold">Yönetim</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-6">
          {[...PRIMARY, ...SECONDARY].map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm",
                  active ? "bg-gold/15 text-gold" : "text-muted hover:text-cream",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            className="mt-2 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-muted"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Çıkış
          </button>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="print-hidden sticky top-0 z-40 flex min-h-14 items-center justify-between border-b border-gold/15 bg-background-deep/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Menüyü aç"
          className="flex h-11 w-11 items-center justify-center"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandLogo href="/admin" size={48} />
        <button
          type="button"
          aria-label="Çıkış"
          className="flex h-11 w-11 items-center justify-center text-muted"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Kapat"
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(88vw,320px)] border-r border-gold/15 bg-background-deep p-4">
            <div className="mb-4 flex items-center justify-between">
              <BrandLogo href="/admin" size={56} />
              <button type="button" className="h-11 w-11" onClick={() => setDrawerOpen(false)}>
                <X />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[...PRIMARY, ...SECONDARY].map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm",
                      active ? "bg-gold/15 text-gold" : "text-cream",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 lg:p-8 lg:pb-8">
        <AdminLiveAlerts />
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Admin alt menü"
        className="print-hidden fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-background-deep/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {PRIMARY.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 text-[9px] uppercase tracking-wide",
                    active ? "text-gold" : "text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
