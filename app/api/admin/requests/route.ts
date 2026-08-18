import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { WaiterRequestStatus } from "@prisma/client";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;
  const requests = await prisma.waiterRequest.findMany({
    include: { table: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return NextResponse.json({ requests });
}

export async function PATCH(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (!body?.id || !body?.status) return jsonError("Geçersiz istek.");
  const updated = await prisma.waiterRequest.update({
    where: { id: body.id },
    data: { status: body.status as WaiterRequestStatus },
  });
  return NextResponse.json({ request: updated });
}
