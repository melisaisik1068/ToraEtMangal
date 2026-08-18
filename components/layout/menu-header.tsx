"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useCartUi } from "@/components/cart/cart-provider";
import { getCartTotals, useCartStore } from "@/store/cart";

export function MenuHeader({ backHref = "/" }: { backHref?: string }) {
  const router = useRouter();
  const { setOpen } = useCartUi();
  const items = useCartStore((s) => s.items);
  const { quantity } = getCartTotals(items);

  return (
    <header className="mb-5 grid grid-cols-3 items-center">
      <button
        type="button"
        aria-label="Geri"
        className="flex h-11 w-11 items-center"
        onClick={() => router.push(backHref)}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex justify-center">
        <BrandLogo size={64} />
      </div>
      <button
        type="button"
        aria-label={`Sepet, ${quantity} ürün`}
        className="relative ml-auto flex h-11 w-11 items-center justify-center"
        onClick={() => setOpen(true)}
      >
        <ShoppingBag className="h-5 w-5" />
        {quantity > 0 ? (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-primary-foreground">
            {quantity}
          </span>
        ) : null}
      </button>
    </header>
  );
}
