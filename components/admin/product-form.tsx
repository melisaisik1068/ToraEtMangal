"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Görsel yüklenemedi.");
      return;
    }
    setForm((prev) => ({ ...prev, image: data.url }));
    toast.success("Görsel eklendi.");
  }

  async function save() {
    if (!form.image) {
      toast.error("Ürün görseli gerekli.");
      return;
    }
    setLoading(true);
    const payload = { ...form, price: Number(form.price) };
    const res = await fetch(product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Kayıt başarısız.");
      return;
    }
    toast.success(product?.id ? "Ürün güncellendi." : "Ürün eklendi.");
    router.push("/admin/menu");
  }

  const preview = form.image;
  const isData = preview.startsWith("data:");

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
        <Label>Fiyat (₺)</Label>
        <Input
          type="number"
          min="0"
          step="1"
          value={String(form.price)}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
      </div>

      <div className="space-y-3 rounded-3xl border border-gold/15 p-4">
        <Label>Ürün fotoğrafı</Label>
        {preview ? (
          <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border border-gold/20">
            {isData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Önizleme" className="h-full w-full object-cover" />
            ) : (
              <Image src={preview} alt="Önizleme" fill className="object-cover" sizes="160px" unoptimized />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Henüz görsel yok.</p>
        )}
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <div>
          <Label>veya görsel URL</Label>
          <Input
            value={isData ? "" : form.image}
            placeholder="https://... veya /images/menu/..."
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
        </div>
        {uploading ? <p className="text-xs text-gold">Yükleniyor...</p> : null}
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
      <div>
        <Label>Sıra</Label>
        <Input
          type="number"
          value={String(form.sortOrder)}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
        />
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
      <Button className="min-h-12 w-full" loading={loading} onClick={save}>
        {product?.id ? "Güncelle" : "Ürünü ekle"}
      </Button>
    </div>
  );
}
