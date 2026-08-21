"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NAV_LINKS } from "@/lib/constants";
import { isAppShellPath } from "@/lib/paths";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  if (isAppShellPath(pathname)) return null;

  const drawer = open ? (
    <div className="absolute inset-x-0 top-16 border-t border-gold/15 bg-background-deep/98 px-4 py-4">
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
    return (
      <header className="absolute inset-x-0 top-0 z-50 mx-auto max-w-md">
        <div className="grid h-16 grid-cols-3 items-center px-4">
          <span />
          <div className="flex justify-center">
            <BrandLogo size={64} priority />
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
    <header className="sticky top-0 z-50 mx-auto max-w-md border-b border-gold/15 bg-background-deep/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <BrandLogo size={52} />
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
