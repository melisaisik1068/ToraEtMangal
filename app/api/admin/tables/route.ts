import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { generateTableQrDataUrl } from "@/lib/qr";
import { ensureRestaurantTables } from "@/lib/services/tables";
import { siteUrl } from "@/lib/utils";

const createSchema = z.object({
  number: z.coerce.number().int().min(1).max(999).optional(),
});

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;
  const tables = await ensureRestaurantTables();
  const withQr = await Promise.all(
    tables.map(async (table) => ({
      id: table.id,
      number: table.number,
      isActive: table.isActive,
      qrUrl: siteUrl(`/qr/${table.number}`),
      qrImage: await generateTableQrDataUrl(table.number),
    })),
  );
  return NextResponse.json({ tables: withQr });
}

export async function PATCH(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (!body?.id) return jsonError("Masa id gerekli.");
  const table = await prisma.table.update({
    where: { id: body.id },
    data: { isActive: Boolean(body.isActive) },
  });
  return NextResponse.json({ table });
}

export async function POST(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body ?? {});
  if (!parsed.success) return jsonError("Geçersiz masa numarası.");

  let number = parsed.data.number;
  if (!number) {
    const last = await prisma.table.findFirst({ orderBy: { number: "desc" } });
    number = (last?.number ?? 0) + 1;
  }

  const exists = await prisma.table.findUnique({ where: { number } });
  if (exists) return jsonError(`Masa ${number} zaten kayıtlı.`, 409);

  const table = await prisma.table.create({
    data: {
      number,
      qrToken: `tora-masa-${number}-${crypto.randomUUID().slice(0, 8)}`,
      isActive: true,
    },
  });

  return NextResponse.json({
    table: {
      id: table.id,
      number: table.number,
      isActive: table.isActive,
      qrUrl: siteUrl(`/qr/${table.number}`),
      qrImage: await generateTableQrDataUrl(table.number),
    },
  });
}

const ACTIVE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED"] as const;

export async function DELETE(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) return jsonError("Masa id gerekli.");

  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) return jsonError("Masa bulunamadı.", 404);

  const activeOrders = await prisma.order.count({
    where: { tableId: id, status: { in: [...ACTIVE_ORDER_STATUSES] } },
  });
  if (activeOrders > 0) {
    return jsonError("Masada açık sipariş varken silinemez. Önce hesabı kapatın.", 409);
  }

  await prisma.$transaction(async (tx) => {
    await tx.waiterRequest.deleteMany({ where: { tableId: id } });
    await tx.order.updateMany({ where: { tableId: id }, data: { tableId: null } });
    await tx.table.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true, deleted: { id: table.id, number: table.number } });
}
