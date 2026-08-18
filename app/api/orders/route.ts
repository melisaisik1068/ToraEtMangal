import { NextResponse } from "next/server";
import { clientKey, jsonError } from "@/lib/api";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { createOrderFromCart } from "@/lib/services/orders";
import { createOrderSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "order"), RATE_LIMITS.order.limit, RATE_LIMITS.order.windowMs);
  if (!limited.success) return jsonError("Çok fazla sipariş denemesi.", 429);

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz sipariş.");

  try {
    const order = await createOrderFromCart(parsed.data);
    return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Sipariş oluşturulamadı.", 400);
  }
}
