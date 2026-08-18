export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "PREPARING", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED", "CANCELLED"],
  SERVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatusValue, to: OrderStatusValue) {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function trackingIndex(status: OrderStatusValue) {
  if (status === "CANCELLED") return -1;
  if (status === "PENDING") return 0;
  if (status === "CONFIRMED" || status === "PREPARING") return 1;
  if (status === "READY") return 3;
  if (status === "SERVED" || status === "COMPLETED") return 3;
  return 0;
}

export function cookingActive(status: OrderStatusValue) {
  return status === "PREPARING";
}
