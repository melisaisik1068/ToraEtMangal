"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

type Category = { id: string; name: string };
type Product = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  ingredients?: string;
  allergens?: string;
  price: string | number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  isFeatured: boolean;
  hasDoneness: boolean;
  sortOrder: number;
};

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Product>(
    product ?? {
      name: "",
      description: "",
      price: "",
      image: "",
      categoryId: "",
      isAvailable: true,
      isFeatured: false,
      hasDoneness: false,
      sortOrder: 0,
      ingredients: "",
      allergens: "",
    },
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  async function save() {
    setLoading(true);
    const payload = { ...form, price: Number(form.price) };
    const res = await fetch(product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) router.push("/admin/menu");
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <Label>Ad</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>Açıklama</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <Label>Fiyat</Label>
        <Input value={String(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </div>
      <div>
        <Label>Görsel URL</Label>
        <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
      </div>
      <div>
        <Label>İçindekiler</Label>
        <Input value={form.ingredients ?? ""} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
      </div>
      <div>
        <Label>Alerjen</Label>
        <Input value={form.allergens ?? ""} onChange={(e) => setForm({ ...form, allergens: e.target.value })} />
      </div>
      <div>
        <Label>Kategori</Label>
        <select
          className="min-h-11 w-full rounded-2xl border border-gold/20 bg-background-deep px-3"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Seçin</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isAvailable}
          onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
        />
        Stokta / aktif
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
        />
        Öne çıkan
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.hasDoneness}
          onChange={(e) => setForm({ ...form, hasDoneness: e.target.checked })}
        />
        Pişirme seçeneği
      </label>
      <Button loading={loading} onClick={save}>
        Kaydet
      </Button>
    </div>
  );
}
