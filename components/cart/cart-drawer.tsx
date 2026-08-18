"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartUi } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/dialog";
import { formatTLFromKurus } from "@/lib/money";
import { getCartTotals, useCartStore } from "@/store/cart";

export function CartDrawer() {
  const { open, setOpen } = useCartUi();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const totals = getCartTotals(items);

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="Sepetim" side="right">
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-serif text-2xl">Sepetiniz henüz boş.</p>
          <Button className="mt-6" onClick={() => { setOpen(false); router.push("/menu"); }}>
            Menüyü Keşfet
          </Button>
        </div>
      ) : (
        <div className="flex min-h-[70vh] flex-col">
          {tableNumber ? (
            <p className="mb-4 rounded-2xl border border-gold/20 px-3 py-2 text-sm text-gold">
              Masa {tableNumber}
            </p>
          ) : (
            <p className="mb-4 text-sm text-muted">
              Masa QR kodunu okutursanız siparişiniz masanıza bağlanır.
            </p>
          )}
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 rounded-2xl border border-gold/15 p-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-gold">{formatTLFromKurus(item.unitKurus)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className="h-11 w-11" aria-label="Azalt" onClick={() => decrement(item.key)}>
                      <Minus className="mx-auto h-4 w-4" />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" className="h-11 w-11" aria-label="Artır" onClick={() => increment(item.key)}>
                      <Plus className="mx-auto h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto h-11 w-11 text-destructive"
                      aria-label="Sil"
                      onClick={() => {
                        remove(item.key);
                        toast("Ürün sepetten çıkarıldı.");
                      }}
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 border-t border-gold/15 pt-5">
            <div className="flex justify-between text-sm">
              <span>Ara toplam</span>
              <span>{formatTLFromKurus(totals.subtotalKurus)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Toplam</span>
              <span className="text-gold">{formatTLFromKurus(totals.totalKurus)}</span>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setOpen(false);
                router.push("/order");
              }}
            >
              SİPARİŞİ TAMAMLA
            </Button>
            <Link href="/menu" className="block text-center text-sm text-muted" onClick={() => setOpen(false)}>
              Menüye dön
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}
