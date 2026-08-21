"use client";

import { useState } from "react";
import { Bell, LogOut, UtensilsCrossed } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { QR_SESSION_KEY, useCartStore } from "@/store/cart";

export function TableSessionBar() {
  const pathname = usePathname();
  const router = useRouter();
  const tableNumber = useCartStore((s) => s.tableNumber);
  const clearTable = useCartStore((s) => s.clearTable);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!tableNumber) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/qr/")) return null;

  async function callWaiter() {
    setLoading(true);
    try {
      const res = await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          requestType: "WAITER",
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata oluştu.");
      toast.success("Garson çağrınız iletildi.");
      setNote("");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function leaveTable() {
    try {
      sessionStorage.removeItem(QR_SESSION_KEY);
    } catch {
      // ignore
    }
    clearTable();
    toast.message("Masa bağlantısı kaldırıldı.");
  }

  return (
    <>
      <div className="sticky top-14 z-40 border-b border-cream/15 bg-[rgba(10,24,18,0.94)] px-4 py-2 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Masa {tableNumber}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/menu")}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-cream/30 px-3 text-[10px] uppercase tracking-wide text-cream"
            >
              <UtensilsCrossed className="h-3.5 w-3.5 text-gold" />
              Menü
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-gold px-3 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground"
            >
              <Bell className="h-3.5 w-3.5" />
              Garson
            </button>
            <button
              type="button"
              onClick={leaveTable}
              aria-label="Masadan ayrıl"
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-cream/25 px-2.5 text-[10px] uppercase tracking-wide text-muted"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={`Masa ${tableNumber} · Garson çağır`}>
        <p className="text-sm text-muted">İsterseniz kısa bir not bırakın.</p>
        <Textarea
          className="mt-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: Su, ekstra peçete..."
        />
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button className="flex-1" loading={loading} onClick={callWaiter}>
            Çağır
          </Button>
        </div>
      </Dialog>
    </>
  );
}
