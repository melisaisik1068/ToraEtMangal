import { MenuHeader } from "@/components/layout/menu-header";
import { CategoryPills } from "@/components/menu/category-pills";
import { MenuSearch } from "@/components/menu/menu-search";
import { ProductCard } from "@/components/menu/product-card";
import { EmptyState } from "@/components/ui/states";
import { getActiveCategories, getMenu } from "@/lib/services/catalog";

export const revalidate = 60;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getMenu({ query: q }),
  ]);

  return (
    <div className="px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-3">
      <MenuHeader />
      <h1 className="mb-4 text-center font-serif text-2xl tracking-wide">MENÜ</h1>
      <MenuSearch categories={categories} />
      <div className="mt-4">
        <CategoryPills categories={categories} active="tumu" />
      </div>
      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Ürün bulunamadı" description="Aramanızı veya kategori seçimini değiştirin." />
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
