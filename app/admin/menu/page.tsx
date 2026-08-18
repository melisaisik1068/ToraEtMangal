"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatTL } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  price: string;
  isAvailable: boolean;
  category: { name: string };
};

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);

  function load() {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setProducts(data.products ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Menü"
        subtitle={`${products.length} ürün`}
        action={
          <Link href="/admin/menu/new" className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground">
            Yeni ürün
          </Link>
        }
      />
      <div className="space-y-3">
        {products.map((product) => (
          <AdminCard key={product.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{product.name}</p>
                <p className="mt-1 text-xs text-muted">{product.category.name}</p>
              </div>
              <p className="shrink-0 text-gold">{formatTL(product.price)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={product.isAvailable ? "text-gold" : "text-muted"}>
                {product.isAvailable ? "Aktif" : "Pasif"}
              </span>
              <div className="flex gap-3">
                <Link href={`/admin/menu/${product.id}`} className="text-gold">
                  Düzenle
                </Link>
                <button
                  type="button"
                  className="text-destructive"
                  onClick={async () => {
                    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
