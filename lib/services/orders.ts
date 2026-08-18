import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fromKurus, multiplyKurus, toKurus } from "@/lib/money";
import type { CreateOrderInput } from "@/lib/validations";

export async function nextOrderNumber() {
  const year = new Date().getFullYear();
  const row = await prisma.orderSequence.upsert({
    where: { id: "default" },
    create: { id: "default", year, sequence: 1 },
    update: {},
  });

  const sequence = await prisma.$transaction(async (tx) => {
    const current = await tx.orderSequence.update({
      where: { id: "default" },
      data:
        row.year === year
          ? { sequence: { increment: 1 } }
          : { year, sequence: 1 },
    });
    return current.sequence;
  });

  return `TE${year}${String(sequence).padStart(4, "0")}`;
}

export async function createOrderFromCart(input: CreateOrderInput) {
  const table = await prisma.table.findUnique({
    where: { number: input.tableNumber },
  });
  if (!table || !table.isActive) {
    throw new Error("Masa bulunamadı veya aktif değil.");
  }

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isAvailable: true },
  });
  if (products.length !== productIds.length) {
    throw new Error("Bazı ürünler stokta yok veya bulunamadı.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  let totalKurus = 0;
  const items = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error("Ürün bulunamadı.");
    const unit = toKurus(product.price);
    totalKurus += multiplyKurus(unit, item.quantity);
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(fromKurus(unit).toFixed(2)),
      note: item.note,
      doneness: item.doneness,
    };
  });

  let orderNumber = await nextOrderNumber();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.order.create({
        data: {
          orderNumber,
          tableId: table.id,
          total: new Prisma.Decimal(fromKurus(totalKurus).toFixed(2)),
          note: input.note,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          items: { create: items },
        },
        include: { items: { include: { product: true } }, table: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        orderNumber = await nextOrderNumber();
        continue;
      }
      throw error;
    }
  }
  throw new Error("Sipariş numarası üretilemedi.");
}
