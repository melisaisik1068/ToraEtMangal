import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, table: true },
  });
  if (!order) return jsonError("Sipariş bulunamadı.", 404);
  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total.toString(),
      createdAt: order.createdAt.toISOString(),
      table: order.table,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        status: item.status,
        note: item.note,
        product: { name: item.product.name },
      })),
    },
  });
}
