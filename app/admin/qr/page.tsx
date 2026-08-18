import Link from "next/link";
import { generateTableQrDataUrl } from "@/lib/qr";
import { ensureRestaurantTables } from "@/lib/services/tables";
import { siteUrl } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const tables = await ensureRestaurantTables();
  const cards = await Promise.all(
    tables.map(async (table) => ({
      id: table.id,
      number: table.number,
      isActive: table.isActive,
      qrUrl: siteUrl(`/qr/${table.number}`),
      qrImage: await generateTableQrDataUrl(table.number),
    })),
  );

  return (
    <div>
      <AdminPageHeader
        title="QR Kodları"
        subtitle={`${cards.length} masa QR menüsü`}
        action={
          <Link href="/admin/qr/print-all" className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground">
            Toplu yazdır
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((table) => (
          <article key={table.id} className="rounded-3xl border border-gold/15 bg-background p-4 text-center">
            <p className="font-serif text-2xl">Masa {table.number}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={table.qrImage} alt={`Masa ${table.number} QR kodu`} className="mx-auto mt-3 h-36 w-36" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Link href={`/admin/tables/${table.number}/print`} className="min-h-11 rounded-xl border border-gold/20 px-3 py-2 text-gold">
                Yazdır
              </Link>
              <a href={table.qrImage} download={`tora-et-masa-${table.number}.png`} className="min-h-11 rounded-xl border border-gold/20 px-3 py-2">
                İndir
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
