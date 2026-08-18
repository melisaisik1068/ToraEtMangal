import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { canTransition, type OrderStatusValue } from "@/lib/order-status";
import { orderStatusSchema } from "@/lib/validations";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, table: true },
  });
  if (!order) return jsonError("Sipariş bulunamadı.", 404);
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return jsonError("Geçersiz durum.");

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return jsonError("Sipariş bulunamadı.", 404);
  if (!canTransition(order.status as OrderStatusValue, parsed.data.status)) {
    return jsonError("Bu durum geçişi yapılamaz.");
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ order: updated });
}
