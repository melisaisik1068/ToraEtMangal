"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

type Category = { id: string; name: string; isActive?: boolean };
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

const LIBRARY = [
  "/images/menu/adana-kebap.png",
  "/images/menu/kuzu-pirzola.png",
  "/images/menu/kofte.png",
  "/images/menu/tavuk-izgara.png",
  "/images/menu/kanat.png",
  "/images/menu/sucuk.png",
  "/images/menu/ciger.png",
  "/images/menu/kavurma.png",
  "/images/menu/kaburga.png",
  "/images/menu/beyti.png",
  "/images/menu/manti.png",
  "/images/menu/pizza.png",
  "/images/menu/corba.png",
  "/images/menu/sutlac.png",
  "/images/menu/kahve.png",
  "/images/menu/cay.png",
  "/images/menu/kola.png",
  "/images/menu/ayran.png",
];

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 900;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((value) => resolve(value), "image/jpeg", 0.72),
  );
  if (!blob) throw new Error("Görsel sıkıştırılamadı.");
  return blob;
}

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
      .then((data) => {
        const rows = (data.categories ?? []) as Category[];
        setCategories(rows.filter((item) => item.isActive !== false));
      });
  }, []);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.append("file", compressed, `${file.name.replace(/\.[^.]+$/, "") || "urun"}.jpg`);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Görsel yüklenemedi.");
        return;
      }
      setForm((prev) => ({ ...prev, image: data.url }));
      toast.success("Görsel eklendi.");
    } catch {
      toast.error("Görsel işlenemedi. Daha küçük bir fotoğraf deneyin.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Ürün adı en az 2 karakter olmalı.");
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 8) {
      toast.error("Açıklama en az 8 karakter olmalı.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error("Geçerli bir fiyat girin.");
      return;
    }
    if (!form.categoryId) {
      toast.error("Kategori seçin.");
      return;
    }
    if (!form.image) {
      toast.error("Ürün görseli gerekli. Galeriden seçin veya yükleyin.");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
    };
    const res = await fetch(product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Kayıt başarısız.");
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
        <Label>Açıklama (en az 8 karakter)</Label>
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
          <p className="text-sm text-muted">Henüz görsel yok. Galeriden seçin veya yükleyin.</p>
        )}

        <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Hazır galeri</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {LIBRARY.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, image: src }))}
              className={`relative aspect-square overflow-hidden rounded-xl border ${
                form.image === src ? "border-gold" : "border-gold/20"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="72px" unoptimized />
            </button>
          ))}
        </div>

        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted">Telefon fotoğrafı veya ekran görüntüsü otomatik küçültülür.</p>
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
