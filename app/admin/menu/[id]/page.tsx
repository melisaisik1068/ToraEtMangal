import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return (
    <div>
      <AdminPageHeader title="Ürünü düzenle" subtitle={product.name} />
      <ProductForm
        product={{
          ...product,
          price: product.price.toString(),
          ingredients: product.ingredients ?? "",
          allergens: product.allergens ?? "",
        }}
      />
    </div>
  );
}
