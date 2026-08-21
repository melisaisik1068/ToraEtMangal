import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { ensureRestaurantTables } from "@/lib/services/tables";
import { siteUrl } from "@/lib/utils";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED"] as const;

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;

  const tables = await ensureRestaurantTables();
  const activeOrders = await prisma.order.findMany({
    where: { status: { in: [...ACTIVE_STATUSES] }, tableId: { not: null } },
    include: {
      items: { include: { product: { select: { name: true } } } },
      table: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const byTable = new Map<string, typeof activeOrders>();
  for (const order of activeOrders) {
    if (!order.tableId) continue;
    const list = byTable.get(order.tableId) ?? [];
    list.push(order);
    byTable.set(order.tableId, list);
  }

  return NextResponse.json({
    tables: tables.map((table) => {
      const orders = byTable.get(table.id) ?? [];
      const current = orders[0] ?? null;
      return {
        id: table.id,
        number: table.number,
        isActive: table.isActive,
        qrUrl: siteUrl(`/qr/${table.number}`),
        hasOrder: Boolean(current),
        orderCount: orders.length,
        currentOrder: current
          ? {
              id: current.id,
              orderNumber: current.orderNumber,
              status: current.status,
              total: current.total.toString(),
              note: current.note,
              createdAt: current.createdAt.toISOString(),
              items: current.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                status: item.status,
              })),
            }
          : null,
      };
    }),
  });
}
