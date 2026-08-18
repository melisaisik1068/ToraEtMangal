import { PrintActions } from "@/components/admin/print-actions";
import { generateTableQrDataUrl } from "@/lib/qr";
import { ensureRestaurantTables } from "@/lib/services/tables";

export const dynamic = "force-dynamic";

export default async function PrintAllQrPage() {
  const tables = await ensureRestaurantTables();
  const cards = await Promise.all(
    tables.map(async (table) => ({
      number: table.number,
      qr: await generateTableQrDataUrl(table.number),
    })),
  );

  return (
    <div>
      <div className="print-hidden mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Toplu QR yazdırma</h1>
          <p className="mt-1 text-sm text-muted">Masa 1–{cards.length} yazdırma kartları</p>
        </div>
        <PrintActions tableNumber={0} qr="" printOnly />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 print:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.number}
            className="print-card break-inside-avoid rounded-[2rem] border border-gold bg-cream p-6 text-center text-primary-foreground"
          >
            <p className="text-xs tracking-[0.25em]">TORA ET MANGAL</p>
            <h2 className="mt-2 font-serif text-3xl">MASA {card.number}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.qr} alt={`Masa ${card.number} QR kodu`} className="mx-auto mt-4 h-44 w-44" />
            <p className="mt-4 text-sm tracking-[0.18em]">MENÜ İÇİN OKUTUN</p>
          </article>
        ))}
      </div>
    </div>
  );
}
