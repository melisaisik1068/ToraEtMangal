"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useCartUi } from "@/components/cart/cart-provider";
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

function ProductImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  if (src.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes={sizes}
      loading="lazy"
    />
  );
}

export function ProductCard({ product, layout = "menu" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { setOpen } = useCartUi();

  function add(e?: { preventDefault(): void; stopPropagation(): void }) {
    e?.preventDefault();
    e?.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitKurus: toKurus(product.price),
      quantity: 1,
    });
    toast.success("Sepete eklendi", {
      action: {
        label: "Sepet",
        onClick: () => setOpen(true),
      },
    });
  }

  if (layout === "featured") {
    return (
      <article className="relative w-[148px] shrink-0 snap-start text-center">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative mx-auto h-[88px] w-[88px] overflow-hidden rounded-full border border-gold/30 bg-white/5">
            <ProductImage src={product.image} alt={product.name} sizes="88px" />
          </div>
          <h3 className="mt-3 line-clamp-2 min-h-10 text-sm leading-tight">{product.name}</h3>
          <p className="mt-1 text-sm text-gold">{formatTL(product.price)}</p>
        </Link>
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={add}
            aria-label={`${product.name} sepete ekle`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Link
            href={`/product/${product.slug}`}
            aria-label={`${product.name} detayı`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex gap-3 rounded-2xl border border-gold/20 bg-card/80 p-3">
      <Link href={`/product/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5">
        <ProductImage src={product.image} alt={product.name} sizes="96px" />
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
        className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-gold text-gold active:scale-95"
      >
        <Plus className="h-4 w-4" />
      </button>
    </article>
  );
}
