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

  const footer =
    items.length === 0 ? undefined : (
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Ara toplam</span>
          <span>{formatTLFromKurus(totals.subtotalKurus)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Toplam</span>
          <span className="text-gold">{formatTLFromKurus(totals.totalKurus)}</span>
        </div>
        <Button
          className="min-h-12 w-full"
          onClick={() => {
            setOpen(false);
            router.push("/order");
          }}
        >
          SİPARİŞİ TAMAMLA
        </Button>
        <Link
          href="/menu"
          className="block pb-1 text-center text-sm text-muted"
          onClick={() => setOpen(false)}
        >
          Menüye dön
        </Link>
      </div>
    );

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="Sepetim" side="right" footer={footer}>
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-serif text-2xl">Sepetiniz henüz boş.</p>
          <Button
            className="mt-6"
            onClick={() => {
              setOpen(false);
              router.push("/menu");
            }}
          >
            Menüyü Keşfet
          </Button>
        </div>
      ) : (
        <div>
          {tableNumber ? (
            <p className="mb-4 rounded-2xl border border-gold/20 px-3 py-2 text-sm text-gold">
              Masa {tableNumber}
            </p>
          ) : (
            <p className="mb-4 text-sm text-muted">
              Masa QR kodunu okutursanız siparişiniz masanıza bağlanır.
            </p>
          )}
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 rounded-2xl border border-gold/15 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={item.image.startsWith("data:")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-gold">{formatTLFromKurus(item.unitKurus)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25"
                      aria-label="Azalt"
                      onClick={() => decrement(item.key)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25"
                      aria-label="Artır"
                      onClick={() => increment(item.key)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto flex h-10 w-10 items-center justify-center text-destructive"
                      aria-label="Sil"
                      onClick={() => {
                        remove(item.key);
                        toast("Ürün sepetten çıkarıldı.");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
