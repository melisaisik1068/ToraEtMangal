import Image from "next/image";
import { GALLERY } from "@/lib/constants";
import { getSettings } from "@/lib/services/catalog";

export const metadata = { title: "Hakkımızda" };
export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-10">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">ÇİFTLİKTEN SOFRAMIZA</p>
      <h1 className="mt-2 font-serif text-5xl">Hikâyemiz</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-muted">{settings.aboutText}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GALLERY.map((src, index) => (
          <div
            key={src}
            className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-white/5 sm:aspect-[4/3]"
          >
            <Image
              src={src}
              alt={`TORA ET MANGAL restoran iç mekan ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
