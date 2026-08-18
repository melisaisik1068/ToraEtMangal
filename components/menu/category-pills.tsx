import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryPills({
  categories,
  active,
}: {
  categories: { name: string; slug: string }[];
  active?: string;
}) {
  const items = [{ name: "Tümünü Göster", slug: "tumu" }, ...categories];
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
      {items.map((item) => {
        const isActive = (active ?? "tumu") === item.slug;
        return (
          <Link
            key={item.slug}
            href={item.slug === "tumu" ? "/menu" : `/menu/${item.slug}`}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm leading-[44px]",
              isActive ? "border-gold bg-gold text-primary-foreground" : "border-gold/25 text-cream",
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
