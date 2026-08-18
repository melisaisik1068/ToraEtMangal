"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { formatTL, toKurus } from "@/lib/money";
import { useCartStore } from "@/store/cart";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string | number;
    image: string;
  };
  layout?: "featured" | "menu";
};

export function ProductCard({ product, layout = "menu" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  function add() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitKurus: toKurus(product.price),
      quantity: 1,
    });
    toast.success("Ürün sepete eklendi.");
  }

  if (layout === "featured") {
    return (
      <article className="w-[148px] shrink-0 snap-start text-center">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative mx-auto h-[88px] w-[88px] overflow-hidden rounded-full border border-gold/30">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="88px" />
          </div>
          <h3 className="mt-3 line-clamp-2 min-h-10 text-sm leading-tight">{product.name}</h3>
          <p className="mt-1 text-sm text-gold">{formatTL(product.price)}</p>
        </Link>
        <Link
          href={`/product/${product.slug}`}
          aria-label={`${product.name} detayı`}
          className="mx-auto mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </article>
    );
  }

  return (
    <article className="relative flex gap-3 rounded-2xl border border-gold/20 bg-card/80 p-3">
      <Link href={`/product/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="96px" />
      </Link>
      <div className="min-w-0 flex-1 pr-12">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium uppercase leading-snug text-gold">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted">{product.description}</p>
        </Link>
        <p className="mt-2 text-sm text-gold">{formatTL(product.price)}</p>
      </div>
      <button
        type="button"
        onClick={add}
        aria-label={`${product.name} sepete ekle`}
        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-gold text-gold"
      >
        <Plus className="h-4 w-4" />
      </button>
    </article>
  );
}
