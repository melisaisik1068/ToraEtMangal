"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";

type Category = { id: string; name: string; slug: string; isActive: boolean };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  function load() {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setCategories(data.categories ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader title="Kategoriler" subtitle={`${categories.length} kategori`} />
      <form
        className="mb-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={async (event) => {
          event.preventDefault();
          await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });
          setName("");
          load();
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yeni kategori" />
        <Button type="submit" className="sm:w-auto">
          Ekle
        </Button>
      </form>
      <div className="space-y-3">
        {categories.map((category) => (
          <AdminCard key={category.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{category.name}</span>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/admin/categories", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: category.id, isActive: !category.isActive }),
                    });
                    load();
                  }}
                >
                  {category.isActive ? "Pasif" : "Aktif"}
                </button>
                <button
                  type="button"
                  className="text-destructive"
                  onClick={async () => {
                    await fetch("/api/admin/categories", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: category.id }),
                    });
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
