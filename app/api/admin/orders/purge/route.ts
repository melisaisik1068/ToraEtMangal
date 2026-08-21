import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";

const PERIODS = [7, 30, 60] as const;
const TERMINAL = ["COMPLETED", "CANCELLED"] as const;

const bodySchema = z.object({
  days: z.coerce.number().refine((v): v is (typeof PERIODS)[number] => PERIODS.includes(v as (typeof PERIODS)[number])),
});

function windowFrom(days: number) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  return from;
}

async function summarize(days: number) {
  const from = windowFrom(days);
  const wherePeriod = { createdAt: { gte: from } };

  const [deletable, active, paid] = await Promise.all([
    prisma.order.findMany({
      where: { ...wherePeriod, status: { in: [...TERMINAL] } },
      select: { id: true, status: true, total: true },
    }),
    prisma.order.count({
      where: {
        ...wherePeriod,
        status: { notIn: [...TERMINAL] },
      },
    }),
    prisma.order.aggregate({
      where: { ...wherePeriod, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  const cancelledCount = deletable.filter((o) => o.status === "CANCELLED").length;
  const completedCount = deletable.filter((o) => o.status === "COMPLETED").length;
  const paymentTotal = Number(paid._sum.total ?? 0);

  return {
    days,
    from: from.toISOString(),
    deletableCount: deletable.length,
    completedCount,
    cancelledCount,
    activeCount: active,
    paymentTotal,
    paymentCount: paid._count,
  };
}

export async function GET(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const daysParam = Number(new URL(request.url).searchParams.get("days") ?? 7);
  if (![7, 30, 60].includes(daysParam)) return jsonError("Geçersiz dönem.");

  const summary = await summarize(daysParam);
  return NextResponse.json({ summary });
}

export async function POST(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Geçersiz dönem (7, 30 veya 60).");

  const days = parsed.data.days;
  const from = windowFrom(days);

  const toDelete = await prisma.order.findMany({
    where: {
      createdAt: { gte: from },
      status: { in: [...TERMINAL] },
    },
    select: { id: true },
  });

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, days, message: "Silinecek kayıt yok." });
  }

  const ids = toDelete.map((o) => o.id);

  await prisma.$transaction(async (tx) => {
    await tx.review.updateMany({
      where: { orderId: { in: ids } },
      data: { orderId: null },
    });
    await tx.order.deleteMany({ where: { id: { in: ids } } });
  });

  return NextResponse.json({
    deleted: ids.length,
    days,
    from: from.toISOString(),
  });
}
