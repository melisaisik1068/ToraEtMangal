import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export async function getSettings() {
  try {
    const row = await prisma.restaurantSettings.findUnique({ where: { id: "default" } });
    return row ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getActiveCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getMenu(options?: { categorySlug?: string; query?: string }) {
  const categorySlug = options?.categorySlug;
  const query = options?.query?.trim();

  try {
    return await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(categorySlug && categorySlug !== "tumu"
          ? { category: { slug: categorySlug, isActive: true } }
          : { category: { isActive: true } }),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { isFeatured: true, isAvailable: true },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    });
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  } catch {
    return null;
  }
}

export async function getTableByNumber(number: number) {
  try {
    return await prisma.table.findUnique({
      where: { number },
    });
  } catch {
    return null;
  }
}
