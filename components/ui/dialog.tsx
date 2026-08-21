"use client";

import * as React from "react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useBodyScrollLock(open);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative max-h-[min(90dvh,640px)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-gold/25 bg-background p-6 shadow-xl"
      >
        <h2 id="dialog-title" className="font-serif text-2xl text-cream">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "bottom" | "left";
}) {
  useBodyScrollLock(open);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Paneli kapat"
        className={cn("absolute inset-0 bg-black/50 transition", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={cn(
          "absolute flex flex-col overflow-hidden border border-gold/20 bg-background-deep shadow-2xl transition-transform duration-300",
          side === "right" &&
            "top-0 right-0 bottom-0 h-dvh max-h-dvh w-full max-w-md rounded-l-3xl translate-x-full",
          side === "left" &&
            "top-0 bottom-0 left-0 h-dvh max-h-dvh w-full max-w-sm rounded-r-3xl -translate-x-full",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl translate-y-full",
          open && (side === "bottom" ? "translate-y-0" : "translate-x-0"),
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold/15 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <h2 id="sheet-title" className="font-serif text-2xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 px-3 text-sm text-muted">
            Kapat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-gold/15 bg-background-deep px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
