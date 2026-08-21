import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Pazartesi başlangıç
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date = new Date()) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

async function periodStats(from: Date) {
  const [orderCount, paymentAgg, items] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: from },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: from },
        status: "COMPLETED",
      },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: from },
          status: { not: "CANCELLED" },
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        product: { select: { id: true, name: true } },
      },
    }),
  ]);

  const productMap = new Map<
    string,
    { productId: string; name: string; quantity: number; revenue: number }
  >();

  for (const item of items) {
    const key = item.product.id;
    const current = productMap.get(key) ?? {
      productId: key,
      name: item.product.name,
      quantity: 0,
      revenue: 0,
    };
    current.quantity += item.quantity;
    current.revenue += Number(item.unitPrice) * item.quantity;
    productMap.set(key, current);
  }

  const topProducts = [...productMap.values()].sort((a, b) => b.quantity - a.quantity);

  return {
    from: from.toISOString(),
    orderCount,
    paidOrderCount: paymentAgg._count._all,
    paymentTotal: Number(paymentAgg._sum.total ?? 0),
    topProducts,
  };
}

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;

  const todayStart = startOfDay();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();

  const [
    totalOrders,
    todayOrders,
    pending,
    preparing,
    ready,
    todayReservations,
    activeTables,
    waiterCalls,
    billRequests,
    day,
    week,
    month,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.reservation.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.table.count({ where: { isActive: true } }),
    prisma.waiterRequest.count({ where: { status: "PENDING", requestType: "WAITER" } }),
    prisma.waiterRequest.count({ where: { status: "PENDING", requestType: "BILL" } }),
    periodStats(todayStart),
    periodStats(weekStart),
    periodStats(monthStart),
  ]);

  return NextResponse.json({
    live: {
      totalOrders,
      todayOrders,
      pending,
      preparing,
      ready,
      todayReservations,
      activeTables,
      waiterCalls,
      billRequests,
    },
    summary: { day, week, month },
  });
}
