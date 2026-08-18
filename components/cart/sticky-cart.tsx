"use client";

import { ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCartUi } from "@/components/cart/cart-provider";
import { formatTLFromKurus } from "@/lib/money";
import { getCartTotals, useCartStore } from "@/store/cart";

export function StickyCartBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen } = useCartUi();
  const items = useCartStore((s) => s.items);
  const totals = getCartTotals(items);

  if (totals.quantity === 0) return null;
  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/order/")) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (pathname === "/order") {
          router.push("/order");
          return;
        }
        setOpen(true);
      }}
      className="fixed inset-x-0 bottom-14 z-40 mx-auto flex min-h-12 max-w-md items-center justify-between bg-cream px-5 text-sm font-semibold text-primary-foreground shadow-lg"
      aria-label={`Sepetim, ${totals.quantity} ürün, ${formatTLFromKurus(totals.totalKurus)}`}
    >
      <span>Sepetim ({totals.quantity})</span>
      <span className="inline-flex items-center gap-1">
        {formatTLFromKurus(totals.totalKurus)}
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
