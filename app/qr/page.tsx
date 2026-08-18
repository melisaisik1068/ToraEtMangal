import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { IMAGES } from "@/lib/images";
import { generateTableQrDataUrl } from "@/lib/qr";
import { getSettings } from "@/lib/services/catalog";

export const metadata = { title: "QR Menü" };

const STEPS = [
  { title: "QR KODU OKUT", text: "Masanızdaki QR kodu telefonunuzla okutun." },
  { title: "MENÜYÜ İNCELE", text: "Dijital menümüzden istediğiniz lezzeti seçin." },
  { title: "SİPARİŞİN HAZIR", text: "Siparişiniz mutfağa iletilir ve masanıza servis edilir." },
];

export default async function QrInfoPage() {
  const [qr, settings] = await Promise.all([generateTableQrDataUrl(1), getSettings()]);

  return (
    <>
      <Navbar />
      <div className="px-4 pb-28 pt-20">
        <p className="text-center text-xs uppercase tracking-[0.28em] text-gold">QR SİSTEMİ</p>
        <h1 className="mt-2 text-center font-script text-4xl text-cream">Nasıl Çalışır?</h1>

        <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[1.75rem]">
          <Image src={IMAGES.qrStand} alt="Masadaki QR menü standı" fill className="object-cover" sizes="100vw" />
        </div>

        <ol className="mt-8 space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-semibold text-gold">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gold">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="relative mt-8 overflow-hidden rounded-[1.75rem]">
          <div className="relative aspect-[16/10]">
            <Image src={IMAGES.interior} alt="Restoran iç mekânı" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-background-deep/40 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center justify-center rounded-2xl bg-cream/95 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="Örnek masa QR kodu" width={120} height={120} />
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-center text-xs uppercase tracking-[0.2em] text-gold">BİZİ TAKİP EDİN</h2>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full border border-gold/40 text-sm tracking-wide text-gold"
          >
            INSTAGRAM&apos;DA GÖR
          </a>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {IMAGES.social.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={src} alt="Instagram lezzet paylaşımı" fill className="object-cover" sizes="50vw" />
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/qr/1"
          className="mt-8 flex min-h-12 w-full items-center justify-center rounded-full bg-cream text-sm font-semibold text-primary-foreground"
        >
          QR OKUT
        </Link>
      </div>
    </>
  );
}
