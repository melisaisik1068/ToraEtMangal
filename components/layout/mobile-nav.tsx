"use client";

import { ClipboardList, Home, Phone, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartUi } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/menu", label: "Menü", icon: UtensilsCrossed },
  { href: "/order", label: "Siparişlerim", icon: ClipboardList },
  { href: "/contact", label: "İletişim", icon: Phone },
];

export function MobileNav() {
  const pathname = usePathname();
  const { open: cartOpen } = useCartUi();
  if (pathname === "/" || cartOpen) return null;

  return (
    <nav
      aria-label="Alt gezinme"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-cream/15 bg-[linear-gradient(180deg,rgba(18,53,40,0.92),rgba(10,24,18,0.98))] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-[0.12em]",
                  active ? "text-gold" : "text-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
