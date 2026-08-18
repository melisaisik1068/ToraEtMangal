"use client";

import { createContext, useContext, useMemo, useState } from "react";

type CartUi = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartUiContext = createContext<CartUi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <CartUiContext.Provider value={value}>{children}</CartUiContext.Provider>;
}

export function useCartUi() {
  const ctx = useContext(CartUiContext);
  if (!ctx) throw new Error("useCartUi must be used within CartProvider");
  return ctx;
}
