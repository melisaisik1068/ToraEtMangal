"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";
import { QR_SESSION_KEY, useCartStore } from "@/store/cart";

export function QrWelcome({ tableNumber }: { tableNumber: number }) {
  const router = useRouter();
  const setTable = useCartStore((s) => s.setTable);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(QR_SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setTable(tableNumber);
  }, [setTable, tableNumber]);

  async function sendRequest(requestType: "WAITER" | "BILL") {
    setLoading(true);
    try {
      const res = await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          requestType,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata oluştu.");
      toast.success(
        requestType === "BILL" ? "Hesap talebiniz gönderildi." : "Garson çağrınız iletildi.",
      );
      setNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hata oluştu.");
    } finally {
      setLoading(false);
      setWaiterOpen(false);
      setBillOpen(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center px-4 py-10 text-center">
      <BrandLogo href={`/qr/${tableNumber}`} size={120} />
      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold">HOŞ GELDİNİZ</p>
      <h1 className="mt-3 font-serif text-4xl">Masa No: {tableNumber}</h1>
      <p className="mt-3 text-sm text-muted">
        Menüyü inceleyin, siparişinizi bu masaya gönderin veya garsonu çağırın.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <Button className="w-full" onClick={() => router.push("/menu")}>
          MENÜYÜ AÇ
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setWaiterOpen(true)}>
          GARSON ÇAĞIR
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setBillOpen(true)}>
          HESAP İSTE
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => router.push("/order")}>
          SİPARİŞLERİM
        </Button>
      </div>

      <Dialog open={waiterOpen} onClose={() => setWaiterOpen(false)} title="Garson çağır">
        <p className="text-sm text-muted">Masa {tableNumber} için garson çağrısı gönderilecek.</p>
        <Textarea
          className="mt-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Not (opsiyonel)"
        />
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setWaiterOpen(false)}>
            Vazgeç
          </Button>
          <Button className="flex-1" loading={loading} onClick={() => sendRequest("WAITER")}>
            Evet, çağır
          </Button>
        </div>
      </Dialog>

      <Dialog open={billOpen} onClose={() => setBillOpen(false)} title="Hesap iste">
        <p className="text-sm text-muted">Masa {tableNumber} için hesap talebi gönderilsin mi?</p>
        <Textarea
          className="mt-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Not (opsiyonel)"
        />
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setBillOpen(false)}>
            Vazgeç
          </Button>
          <Button className="flex-1" loading={loading} onClick={() => sendRequest("BILL")}>
            Hesap iste
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
