import Image from "next/image";
import { notFound } from "next/navigation";
import { MenuHeader } from "@/components/layout/menu-header";
import { ProductPurchase } from "@/components/product/product-purchase";
import { getProductBySlug } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-4">
      <MenuHeader backHref="/menu" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2rem]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={product.image.startsWith("/") || product.image.startsWith("data:")}
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{product.category.name}</p>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <p className="mt-4 text-muted">{product.description}</p>
          <div className="mt-8">
            <ProductPurchase
              product={{
                ...product,
                price: product.price.toString(),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
