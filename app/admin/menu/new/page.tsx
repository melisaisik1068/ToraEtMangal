import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader title="Yeni ürün" subtitle="Menüye ürün ekle" />
      <ProductForm />
    </div>
  );
}
