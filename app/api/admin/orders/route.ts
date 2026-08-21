import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") ?? 120) || 120, 120);
  const statusFilter =
    statusParam && statusParam !== "all"
      ? (statusParam.split(",").filter(Boolean) as OrderStatus[])
      : null;

  const orders = await prisma.order.findMany({
    where: statusFilter?.length ? { status: { in: statusFilter } } : undefined,
    include: { items: { include: { product: true } }, table: true },
    orderBy: { createdAt: "desc" },
    take: limit,
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
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        note: item.note,
        status: item.status,
      })),
    })),
  });
}
