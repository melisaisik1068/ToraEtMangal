"use client";

import * as React from "react";
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
        className="relative w-full max-w-md rounded-3xl border border-gold/25 bg-background p-6 shadow-xl"
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
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: "right" | "bottom" | "left";
}) {
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
        "fixed inset-0 z-[70] transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
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
          "absolute border border-gold/20 bg-background-deep shadow-2xl transition-transform duration-300",
          side === "right" &&
            "inset-y-0 right-0 w-full max-w-md rounded-l-3xl data-[open=true]:translate-x-0 translate-x-full",
          side === "left" &&
            "inset-y-0 left-0 w-full max-w-sm rounded-r-3xl data-[open=true]:translate-x-0 -translate-x-full",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl data-[open=true]:translate-y-0 translate-y-full",
          open && (side === "bottom" ? "translate-y-0" : "translate-x-0"),
        )}
      >
        <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
          <h2 id="sheet-title" className="font-serif text-2xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 px-3 text-sm text-muted">
            Kapat
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
