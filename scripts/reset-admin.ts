import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@toraetmangal.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeThisPassword123";
  const name = process.env.ADMIN_NAME ?? "TORA ET Yönetim";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, name, role: "ADMIN", passwordHash },
  });

  console.log(`Admin hazır: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
