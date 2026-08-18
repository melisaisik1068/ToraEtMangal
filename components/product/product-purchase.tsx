"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { DONENESS_OPTIONS } from "@/lib/constants";
import { formatTL, toKurus } from "@/lib/money";
import { useCartStore } from "@/store/cart";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string | null;
  allergens: string | null;
  price: string | number;
  image: string;
  hasDoneness: boolean;
};

export function ProductPurchase({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [doneness, setDoneness] = useState<string>("medium");
  const [note, setNote] = useState("");
  const price = useMemo(() => formatTL(product.price), [product.price]);

  function add() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitKurus: toKurus(product.price),
      quantity: qty,
      note: note || undefined,
      doneness: product.hasDoneness ? doneness : undefined,
    });
    toast.success("Ürün sepete eklendi.");
  }

  return (
    <div className="space-y-6">
      <p className="text-2xl text-gold">{price}</p>
      {product.hasDoneness ? (
        <fieldset>
          <legend className="mb-3 text-xs uppercase tracking-[0.18em] text-gold">Porsiyon pişirme</legend>
          <div className="flex flex-wrap gap-2">
            {DONENESS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDoneness(option.value)}
                className={`min-h-11 rounded-full border px-4 text-sm ${
                  doneness === option.value ? "border-gold bg-gold/15 text-gold" : "border-gold/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div className="flex items-center gap-4">
        <button type="button" className="h-11 w-11 rounded-full border border-gold/30" onClick={() => setQty((v) => Math.max(1, v - 1))}>
          −
        </button>
        <span aria-live="polite">{qty}</span>
        <button type="button" className="h-11 w-11 rounded-full border border-gold/30" onClick={() => setQty((v) => Math.min(20, v + 1))}>
          +
        </button>
      </div>
      <div>
        <label htmlFor="note" className="mb-2 block text-xs uppercase tracking-[0.18em] text-gold">
          Not
        </label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn. soğansız, az acılı" />
      </div>
      {product.ingredients ? (
        <p className="text-sm text-muted">
          <span className="text-gold">İçindekiler: </span>
          {product.ingredients}
        </p>
      ) : null}
      {product.allergens ? (
        <p className="text-sm text-muted">
          <span className="text-gold">Alerjen: </span>
          {product.allergens}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1" onClick={add}>
          SEPETE EKLE
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            add();
            router.push("/order");
          }}
        >
          Siparişe geç
        </Button>
      </div>
    </div>
  );
}
