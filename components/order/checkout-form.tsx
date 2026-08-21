"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { LOCAL_ORDERS_KEY } from "@/lib/constants";
import { formatTLFromKurus } from "@/lib/money";
import { getCartTotals, useCartStore } from "@/store/cart";

function saveOrderId(id: string) {
  const current = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) ?? "[]") as string[];
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([id, ...current.filter((x) => x !== id)].slice(0, 20)));
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const clear = useCartStore((s) => s.clear);
  const totals = getCartTotals(items);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!tableNumber) {
      toast.error("Sipariş için masanızdaki QR kodu okutmanız gerekir.");
      return;
    }
    if (items.length === 0) {
      toast.error("Sepetiniz henüz boş.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          note,
          customerName: name || undefined,
          customerPhone: phone || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            note: item.note,
            doneness: item.doneness,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata oluştu.");
      saveOrderId(data.order.id);
      clear();
      toast.success("Siparişiniz oluşturuldu.");
      router.push(`/order/${data.order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-gold/20 p-8 text-center">
        <p className="font-serif text-3xl">Sepetiniz henüz boş.</p>
        <Button className="mt-6" onClick={() => router.push("/menu")}>
          Menüyü Keşfet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gold/20 p-5">
        <p className="text-sm text-gold">
          {tableNumber ? `Masa ${tableNumber}` : "Sipariş için masadaki QR kodu okutun"}
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="text-gold">{formatTLFromKurus(item.unitKurus * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-gold/15 pt-4 font-medium">
          <span>Toplam</span>
          <span className="text-gold">{formatTLFromKurus(totals.totalKurus)}</span>
        </div>
      </div>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız (opsiyonel)" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon (opsiyonel)" />
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sipariş notu" />
        <Button className="w-full" loading={loading} disabled={!tableNumber} onClick={submit}>
          {tableNumber ? "SİPARİŞİ GÖNDER" : "ÖNCE MASA QR OKUTUN"}
        </Button>
      </div>
    </div>
  );
}
