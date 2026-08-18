import { notFound } from "next/navigation";
import { MenuHeader } from "@/components/layout/menu-header";
import { CategoryPills } from "@/components/menu/category-pills";
import { MenuSearch } from "@/components/menu/menu-search";
import { ProductCard } from "@/components/menu/product-card";
import { EmptyState } from "@/components/ui/states";
import { getActiveCategories, getMenu } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export default async function CategoryMenuPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categories = await getActiveCategories();
  const exists = categories.some((item) => item.slug === category);
  if (!exists) notFound();
  const products = await getMenu({ categorySlug: category });

  return (
    <div className="px-4 pb-28 pt-3">
      <MenuHeader backHref="/menu" />
      <h1 className="mb-4 text-center font-serif text-2xl tracking-wide">MENÜ</h1>
      <MenuSearch categories={categories} />
      <div className="mt-4">
        <CategoryPills categories={categories} active={category} />
      </div>
      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Ürün bulunamadı" />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, price: product.price.toString() }} />
          ))}
        </div>
      )}
    </div>
  );
}
