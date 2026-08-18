import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { ReservationStatus } from "@prisma/client";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;
  const reservations = await prisma.reservation.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reservations });
}

export async function PATCH(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (!body?.id || !body?.status) return jsonError("Geçersiz istek.");
  const reservation = await prisma.reservation.update({
    where: { id: body.id },
    data: { status: body.status as ReservationStatus },
  });
  return NextResponse.json({ reservation });
}
