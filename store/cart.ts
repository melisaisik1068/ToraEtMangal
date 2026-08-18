import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { addKurus, multiplyKurus } from "@/lib/money";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitKurus: number;
  quantity: number;
  note?: string;
  doneness?: string;
};

type CartState = {
  items: CartItem[];
  tableNumber: number | null;
  setTable: (tableNumber: number | null) => void;
  addItem: (item: Omit<CartItem, "key">) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  updateNote: (key: string, note: string) => void;
  clear: () => void;
};

export function cartItemKey(input: { productId: string; doneness?: string; note?: string }) {
  return [input.productId, input.doneness ?? "", input.note ?? ""].join("::");
}

export function getCartTotals(items: CartItem[]) {
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalKurus = items.reduce(
    (sum, item) => addKurus(sum, multiplyKurus(item.unitKurus, item.quantity)),
    0,
  );
  return { quantity, subtotalKurus, totalKurus: subtotalKurus };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      setTable: (tableNumber) => set({ tableNumber }),
      addItem: (item) => {
        const key = cartItemKey(item);
        const existing = get().items.find((row) => row.key === key);
        if (existing) {
          set({
            items: get().items.map((row) =>
              row.key === key ? { ...row, quantity: Math.min(20, row.quantity + item.quantity) } : row,
            ),
          });
          return;
        }
        set({ items: [...get().items, { ...item, key }] });
      },
      increment: (key) =>
        set({
          items: get().items.map((row) =>
            row.key === key ? { ...row, quantity: Math.min(20, row.quantity + 1) } : row,
          ),
        }),
      decrement: (key) =>
        set({
          items: get()
            .items.map((row) => (row.key === key ? { ...row, quantity: row.quantity - 1 } : row))
            .filter((row) => row.quantity > 0),
        }),
      remove: (key) => set({ items: get().items.filter((row) => row.key !== key) }),
      updateNote: (key, note) =>
        set({
          items: get().items.map((row) => (row.key === key ? { ...row, note } : row)),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: CART_STORAGE_KEY },
  ),
);
