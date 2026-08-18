import { prisma } from "@/lib/db";
import { ensureRestaurantTables } from "@/lib/services/tables";

async function main() {
  const tables = await ensureRestaurantTables(20);
  console.log(`Hazır masa sayısı: ${tables.length} (${tables.map((table) => table.number).join(", ")})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
