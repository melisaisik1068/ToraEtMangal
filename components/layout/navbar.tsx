"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NAV_LINKS } from "@/lib/constants";
import { isAppShellPath } from "@/lib/paths";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const tableNumber = useCartStore((s) => s.tableNumber);

  if (isAppShellPath(pathname)) return null;

  const drawer = open ? (
    <div className="absolute inset-x-0 top-full border-t border-cream/15 bg-[rgba(10,24,18,0.98)] px-4 py-4 backdrop-blur-xl">
      <nav className="flex flex-col gap-1" aria-label="Mobil menü">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="min-h-12 rounded-2xl px-3 py-3 text-cream"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  ) : null;

  if (isHome) {
    // Masa oturumu varken absolute logo + sticky bar çakışmasın diye tek sticky header
    if (tableNumber) {
      return (
        <header className="sticky top-0 z-50 mx-auto max-w-md border-b border-cream/15 bg-[rgba(10,24,18,0.94)] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-center px-4">
            <BrandLogo size={48} priority />
          </div>
          {drawer}
        </header>
      );
    }

    return (
      <header className="absolute inset-x-0 top-0 z-50 mx-auto max-w-md">
        <div className="grid h-16 grid-cols-3 items-center px-4">
          <span />
          <div className="flex justify-center">
            <BrandLogo size={56} priority />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center text-cream drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {drawer}
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto max-w-md border-b border-cream/15 bg-[rgba(10,24,18,0.94)] backdrop-blur-xl",
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <BrandLogo size={44} />
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {drawer}
    </header>
  );
}
