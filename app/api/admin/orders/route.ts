import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, table: true },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total.toString(),
      createdAt: order.createdAt.toISOString(),
      tableNumber: order.table?.number ?? null,
      note: order.note,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        note: item.note,
      })),
    })),
  });
}
