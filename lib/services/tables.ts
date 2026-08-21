import { prisma } from "@/lib/db";
import { TABLE_COUNT } from "@/lib/constants";

/** İlk kurulumda varsayılan masaları oluşturur; silinen masaları geri getirmez. */
export async function ensureRestaurantTables(count = TABLE_COUNT) {
  const existingCount = await prisma.table.count();
  if (existingCount === 0) {
    for (let number = 1; number <= count; number += 1) {
      await prisma.table.create({
        data: {
          number,
          qrToken: `tora-masa-${number}-${crypto.randomUUID().slice(0, 8)}`,
          isActive: true,
        },
      });
    }
  }

  return prisma.table.findMany({ orderBy: { number: "asc" } });
}
