import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { deriveOrderStatusFromItems } from "@/lib/order-item-status";

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
] as const;

const patchSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("status"),
    status: z.enum(statuses),
  }),
  z.object({
    op: z.literal("itemStatus"),
    itemId: z.string().min(1),
    status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED", "CANCELLED"]),
  }),
  z.object({
    op: z.literal("addItem"),
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(50),
    note: z.string().max(240).optional(),
  }),
  z.object({
    op: z.literal("setItemQty"),
    itemId: z.string().min(1),
    quantity: z.coerce.number().int().min(0).max(50),
  }),
  z.object({
    op: z.literal("removeItem"),
    itemId: z.string().min(1),
  }),
  z.object({
    op: z.literal("note"),
    note: z.string().max(500).nullable(),
  }),
]);

async function loadOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, table: true },
  });
}

async function recalcTotal(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const total = items.reduce(
    (sum, item) =>
      item.status === "CANCELLED" ? sum : sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  return prisma.order.update({
    where: { id: orderId },
    data: { total: new Prisma.Decimal(total.toFixed(2)) },
    include: { items: { include: { product: true } }, table: true },
  });
}

async function syncOrderStatusFromItems(orderId: string, currentStatus: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { status: true },
  });
  const next = deriveOrderStatusFromItems(
    items,
    currentStatus as Parameters<typeof deriveOrderStatusFromItems>[1],
  );
  if (next === currentStatus) {
    return loadOrder(orderId);
  }
  return prisma.order.update({
    where: { id: orderId },
    data: { status: next },
    include: { items: { include: { product: true } }, table: true },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await params;
  const order = await loadOrder(id);
  if (!order) return jsonError("Sipariş bulunamadı.", 404);
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await request.json().catch(() => null);

  // Geriye uyumluluk: { status } gönderilirse
  const normalized =
    body && typeof body === "object" && "status" in body && !("op" in body)
      ? { op: "status" as const, status: body.status }
      : body;

  const parsed = patchSchema.safeParse(normalized);
  if (!parsed.success) return jsonError("Geçersiz istek.");

  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return jsonError("Sipariş bulunamadı.", 404);

  if (
    (existing.status === "COMPLETED" || existing.status === "CANCELLED") &&
    parsed.data.op !== "status"
  ) {
    return jsonError("Tamamlanan veya iptal edilen sipariş düzenlenemez.");
  }

  switch (parsed.data.op) {
    case "status": {
      if (parsed.data.status === "COMPLETED" || parsed.data.status === "CANCELLED") {
        const itemStatus = parsed.data.status === "CANCELLED" ? "CANCELLED" : "SERVED";
        await prisma.orderItem.updateMany({
          where: {
            orderId: id,
            ...(parsed.data.status === "COMPLETED"
              ? { status: { not: "CANCELLED" } }
              : {}),
          },
          data: { status: itemStatus },
        });
      } else if (parsed.data.status === "CONFIRMED" || parsed.data.status === "PREPARING") {
        // Sipariş onayında henüz ilerlemiş ürünleri bozma; sadece bekleyenleri ilerlet
        await prisma.orderItem.updateMany({
          where: { orderId: id, status: "PENDING" },
          data: { status: parsed.data.status === "CONFIRMED" ? "CONFIRMED" : "PREPARING" },
        });
      }
      const order = await prisma.order.update({
        where: { id },
        data: { status: parsed.data.status },
        include: { items: { include: { product: true } }, table: true },
      });
      return NextResponse.json({ order });
    }
    case "itemStatus": {
      const { itemId, status: itemStatus } = parsed.data;
      const item = existing.items.find((row) => row.id === itemId);
      if (!item) return jsonError("Ürün kalemi bulunamadı.", 404);
      await prisma.orderItem.update({
        where: { id: itemId },
        data: { status: itemStatus },
      });
      const order =
        itemStatus === "CANCELLED"
          ? await recalcTotal(id).then(async (updated) => {
              const synced = await syncOrderStatusFromItems(id, updated.status);
              return synced ?? updated;
            })
          : await syncOrderStatusFromItems(id, existing.status);
      return NextResponse.json({ order });
    }
    case "addItem": {
      const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
      if (!product) return jsonError("Ürün bulunamadı.", 404);
      const same = existing.items.find(
        (item) =>
          item.productId === product.id &&
          !item.note &&
          !item.doneness &&
          item.status !== "CANCELLED" &&
          item.status !== "SERVED",
      );
      if (same) {
        await prisma.orderItem.update({
          where: { id: same.id },
          data: { quantity: same.quantity + parsed.data.quantity },
        });
      } else {
        await prisma.orderItem.create({
          data: {
            orderId: id,
            productId: product.id,
            quantity: parsed.data.quantity,
            unitPrice: product.price,
            note: parsed.data.note,
            status: "PENDING",
          },
        });
      }
      const order = await recalcTotal(id);
      const synced = await syncOrderStatusFromItems(id, order.status);
      return NextResponse.json({ order: synced ?? order });
    }
    case "setItemQty": {
      if (parsed.data.quantity === 0) {
        await prisma.orderItem.delete({ where: { id: parsed.data.itemId } });
      } else {
        await prisma.orderItem.update({
          where: { id: parsed.data.itemId },
          data: { quantity: parsed.data.quantity },
        });
      }
      const order = await recalcTotal(id);
      const synced = await syncOrderStatusFromItems(id, order.status);
      return NextResponse.json({ order: synced ?? order });
    }
    case "removeItem": {
      await prisma.orderItem.delete({ where: { id: parsed.data.itemId } });
      const order = await recalcTotal(id);
      const synced = await syncOrderStatusFromItems(id, order.status);
      return NextResponse.json({ order: synced ?? order });
    }
    case "note": {
      const order = await prisma.order.update({
        where: { id },
        data: { note: parsed.data.note },
        include: { items: { include: { product: true } }, table: true },
      });
      return NextResponse.json({ order });
    }
    default:
      return jsonError("Geçersiz işlem.");
  }
}
