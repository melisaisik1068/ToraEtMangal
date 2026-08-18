import { NextResponse } from "next/server";
import { clientKey, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { waiterRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "waiter"), RATE_LIMITS.waiter.limit, RATE_LIMITS.waiter.windowMs);
  if (!limited.success) return jsonError("Çok fazla istek.", 429);

  const body = await request.json().catch(() => null);
  const parsed = waiterRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError("Geçersiz istek.");

  const table = await prisma.table.findUnique({ where: { number: parsed.data.tableNumber } });
  if (!table || !table.isActive) return jsonError("Masa bulunamadı.", 404);

  const created = await prisma.waiterRequest.create({
    data: {
      tableId: table.id,
      requestType: parsed.data.requestType,
      note: parsed.data.note,
    },
  });
  return NextResponse.json({ request: created });
}
