import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

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
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: start } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.reservation.count({ where: { createdAt: { gte: start } } }),
    prisma.table.count({ where: { isActive: true } }),
    prisma.waiterRequest.count({ where: { status: "PENDING", requestType: "WAITER" } }),
    prisma.waiterRequest.count({ where: { status: "PENDING", requestType: "BILL" } }),
  ]);

  return NextResponse.json({
    totalOrders,
    todayOrders,
    pending,
    preparing,
    ready,
    todayReservations,
    activeTables,
    waiterCalls,
    billRequests,
  });
}
