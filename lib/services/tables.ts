import { prisma } from "@/lib/db";
import { TABLE_COUNT } from "@/lib/constants";

export async function ensureRestaurantTables(count = TABLE_COUNT) {
  const existing = await prisma.table.findMany({ select: { number: true } });
  const numbers = new Set(existing.map((table) => table.number));

  for (let number = 1; number <= count; number += 1) {
    if (numbers.has(number)) continue;
    await prisma.table.create({
      data: {
        number,
        qrToken: `tora-masa-${number}-${crypto.randomUUID().slice(0, 8)}`,
        isActive: true,
      },
    });
  }

  return prisma.table.findMany({ orderBy: { number: "asc" } });
}
