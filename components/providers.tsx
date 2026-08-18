"use client";

import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/cart-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "!bg-background !text-foreground !border-gold/30",
        }}
      />
    </CartProvider>
  );
}
