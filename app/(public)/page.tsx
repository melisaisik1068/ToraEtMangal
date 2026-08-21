import { ProductCard } from "@/components/menu/product-card";
import { FeatureCards } from "@/components/hero/feature-cards";
import { Hero } from "@/components/hero/hero";
import { HomeContactBar } from "@/components/hero/home-contact-bar";
import { getFeaturedProducts } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <Hero />
      <FeatureCards />
      <section className="px-4 py-5">
        <p className="text-center text-xs uppercase tracking-[0.28em] text-gold">ÖNE ÇIKAN LEZZETLER</p>
        <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              layout="featured"
              product={{
                ...product,
                price: product.price.toString(),
              }}
            />
          ))}
        </div>
      </section>
      <div className="h-16" />
      <HomeContactBar />
    </>
  );
}
