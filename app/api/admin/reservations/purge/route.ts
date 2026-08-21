import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";

const PERIODS = [7, 30, 60] as const;
const TERMINAL = ["CANCELLED", "COMPLETED"] as const;

const bodySchema = z.object({
  days: z.coerce
    .number()
    .refine((v): v is (typeof PERIODS)[number] =>
      PERIODS.includes(v as (typeof PERIODS)[number]),
    ),
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

  const [deletable, active] = await Promise.all([
    prisma.reservation.findMany({
      where: { ...wherePeriod, status: { in: [...TERMINAL] } },
      select: { id: true, status: true },
    }),
    prisma.reservation.count({
      where: {
        ...wherePeriod,
        status: { notIn: [...TERMINAL] },
      },
    }),
  ]);

  return {
    days,
    from: from.toISOString(),
    deletableCount: deletable.length,
    completedCount: deletable.filter((r) => r.status === "COMPLETED").length,
    cancelledCount: deletable.filter((r) => r.status === "CANCELLED").length,
    activeCount: active,
  };
}

export async function GET(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const daysParam = Number(new URL(request.url).searchParams.get("days") ?? 7);
  if (![7, 30, 60].includes(daysParam)) return jsonError("Geçersiz dönem.");

  return NextResponse.json({ summary: await summarize(daysParam) });
}

export async function POST(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Geçersiz dönem (7, 30 veya 60).");

  const days = parsed.data.days;
  const from = windowFrom(days);

  const result = await prisma.reservation.deleteMany({
    where: {
      createdAt: { gte: from },
      status: { in: [...TERMINAL] },
    },
  });

  return NextResponse.json({
    deleted: result.count,
    days,
    from: from.toISOString(),
  });
}
