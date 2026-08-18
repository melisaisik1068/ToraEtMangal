import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateTableQrDataUrl } from "@/lib/qr";
import { parseTableParam } from "@/lib/utils";
import { PrintActions } from "@/components/admin/print-actions";

export const dynamic = "force-dynamic";

export default async function QrPrintPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const tableNumber = parseTableParam(number);
  if (!tableNumber) notFound();
  const table = await prisma.table.findUnique({ where: { number: tableNumber } });
  if (!table) notFound();
  const qr = await generateTableQrDataUrl(table.number);

  return (
    <div>
      <PrintActions tableNumber={table.number} qr={qr} />
      <article className="print-card mx-auto mt-6 max-w-sm rounded-[2rem] border border-gold bg-cream p-8 text-center text-primary-foreground">
        <p className="text-xs tracking-[0.25em]">TORA ET MANGAL</p>
        <h1 className="mt-3 font-serif text-4xl">MASA {table.number}</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`Masa ${table.number} QR kodu`} className="mx-auto mt-6 h-52 w-52" />
        <p className="mt-6 text-sm tracking-[0.18em]">MENÜ İÇİN OKUTUN</p>
      </article>
    </div>
  );
}
