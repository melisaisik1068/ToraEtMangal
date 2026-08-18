import Link from "next/link";
import { ScanLine } from "lucide-react";
import { generateTableQrDataUrl } from "@/lib/qr";

export async function QrSection() {
  const qr = await generateTableQrDataUrl(1);

  return (
    <section className="px-4 py-6">
      <div className="rounded-[1.75rem] bg-cream px-5 py-6 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.28em] opacity-80">QR İLE MENÜYE ULAŞIN</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-6 opacity-90">
              Masanızdaki QR kodu okutarak dijital menümüze anında ulaşın.
            </p>
            <Link
              href="/qr/1"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-background px-5 text-sm font-semibold text-cream"
            >
              <ScanLine className="h-4 w-4" />
              QR OKUT
            </Link>
          </div>
          <div className="shrink-0 rounded-2xl bg-cream-light p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR menü kodu" width={120} height={120} />
          </div>
        </div>
      </div>
    </section>
  );
}
