import type { OrderStatus } from "@prisma/client";

/** Aktif (iptal olmayan) ürünlerden sipariş durumunu türet. */
export function deriveOrderStatusFromItems(
  items: { status: OrderStatus }[],
  current: OrderStatus,
): OrderStatus {
  if (current === "COMPLETED") return "COMPLETED";

  const active = items.filter((item) => item.status !== "CANCELLED");
  if (active.length === 0) return "CANCELLED";

  if (active.every((item) => item.status === "SERVED")) return "SERVED";
  if (active.some((item) => item.status === "READY")) return "READY";
  if (active.some((item) => item.status === "PREPARING" || item.status === "CONFIRMED")) {
    return "PREPARING";
  }
  if (active.every((item) => item.status === "PENDING")) return "PENDING";
  return "PREPARING";
}
