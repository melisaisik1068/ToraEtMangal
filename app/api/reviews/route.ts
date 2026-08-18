import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return jsonError("Geçersiz değerlendirme.");

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return jsonError("Sipariş bulunamadı.", 404);

  const review = await prisma.review.create({
    data: {
      orderId: parsed.data.orderId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });
  return NextResponse.json({ review: { id: review.id } });
}
