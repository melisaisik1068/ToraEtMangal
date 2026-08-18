"use client";

export function PrintActions({
  tableNumber,
  qr,
  printOnly = false,
}: {
  tableNumber: number;
  qr: string;
  printOnly?: boolean;
}) {
  return (
    <div className="print-hidden flex flex-wrap gap-3">
      <button
        type="button"
        className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground"
        onClick={() => window.print()}
      >
        Yazdır
      </button>
      {!printOnly && qr ? (
        <a
          href={qr}
          download={`tora-et-masa-${tableNumber}.png`}
          className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-5 text-sm"
        >
          QR indir
        </a>
      ) : null}
    </div>
  );
}
