import type { OrderStatus } from "@prisma/client";

/**
 * Aktif ürünlerden sipariş durumunu türet.
 * En yavaş kalan (darboğaz) ürünü esas alır — tek ürün ilerleyince hepsi hazır görünmez.
 */
export function deriveOrderStatusFromItems(
  items: { status: OrderStatus }[],
  current: OrderStatus,
): OrderStatus {
  if (current === "COMPLETED") return "COMPLETED";

  const active = items.filter((item) => item.status !== "CANCELLED");
  if (active.length === 0) return "CANCELLED";

  if (active.every((item) => item.status === "SERVED")) return "SERVED";
  if (active.some((item) => item.status === "PENDING")) return "PENDING";
  if (active.some((item) => item.status === "CONFIRMED" || item.status === "PREPARING")) {
    return "PREPARING";
  }
  if (active.some((item) => item.status === "READY")) return "READY";
  return "PREPARING";
}
