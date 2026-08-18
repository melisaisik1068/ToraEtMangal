import { NextResponse } from "next/server";
import { clientKey, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { reservationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const limited = rateLimit(
    clientKey(request, "reservation"),
    RATE_LIMITS.reservation.limit,
    RATE_LIMITS.reservation.windowMs,
  );
  if (!limited.success) return jsonError("Çok fazla rezervasyon denemesi.", 429);

  const body = await request.json().catch(() => null);
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz form.");

  const reservation = await prisma.reservation.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      date: new Date(parsed.data.date),
      time: parsed.data.time,
      guests: parsed.data.guests,
      note: parsed.data.note,
    },
  });
  return NextResponse.json({ reservation: { id: reservation.id } });
}
