import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { generateTableQrDataUrl } from "@/lib/qr";
import { ensureRestaurantTables } from "@/lib/services/tables";
import { siteUrl } from "@/lib/utils";

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

export async function POST() {
  const { error } = await assertAdmin();
  if (error) return error;
  const last = await prisma.table.findFirst({ orderBy: { number: "desc" } });
  const number = (last?.number ?? 0) + 1;
  const table = await prisma.table.create({
    data: {
      number,
      qrToken: `tora-masa-${number}-${crypto.randomUUID().slice(0, 8)}`,
    },
  });
  return NextResponse.json({
    table: {
      ...table,
      qrUrl: siteUrl(`/qr/${table.number}`),
      qrImage: await generateTableQrDataUrl(table.number),
    },
  });
}
