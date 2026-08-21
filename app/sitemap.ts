import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export default async function sitemap() {
  const routes = ["", "/menu", "/about", "/contact", "/reservation"].map((path) => ({
    url: siteUrl(path),
    lastModified: new Date(),
  }));

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { isAvailable: true }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...routes,
      ...products.map((product) => ({
        url: siteUrl(`/product/${product.slug}`),
        lastModified: product.updatedAt,
      })),
      ...categories.map((category) => ({
        url: siteUrl(`/menu/${category.slug}`),
        lastModified: category.updatedAt,
      })),
    ];
  } catch {
    return routes;
  }
}
