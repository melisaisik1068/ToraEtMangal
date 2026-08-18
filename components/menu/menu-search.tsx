"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MenuSearch({
  categories = [],
}: {
  categories?: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="relative">
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams(params.toString());
          if (value) next.set("q", value);
          else next.delete("q");
          router.push(`/menu?${next.toString()}`);
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ara..."
          aria-label="Menüde ara"
          className="pr-14"
        />
        <button
          type="button"
          aria-label="Filtreler"
          aria-expanded={filtersOpen}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-gold"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </form>
      {filtersOpen && categories.length > 0 ? (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gold/20 bg-background-deep p-3 shadow-xl">
          <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-gold">Kategoriler</p>
          <div className="flex flex-col">
            <button
              type="button"
              className={cn("min-h-11 rounded-xl px-3 text-left text-sm", "hover:bg-gold/10")}
              onClick={() => {
                setFiltersOpen(false);
                router.push("/menu");
              }}
            >
              Tümünü Göster
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className="min-h-11 rounded-xl px-3 text-left text-sm hover:bg-gold/10"
                onClick={() => {
                  setFiltersOpen(false);
                  router.push(`/menu/${category.slug}`);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
