import Image from "next/image";
import { GALLERY } from "@/lib/constants";
import { getSettings } from "@/lib/services/catalog";

export const metadata = { title: "Hakkımızda" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">ÇİFTLİKTEN SOFRAMIZA</p>
      <h1 className="mt-2 font-serif text-5xl">Hikâyemiz</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-muted">{settings.aboutText}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GALLERY.map((src) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src={src} alt="TORA ET MANGAL restoran atmosferi" fill className="object-cover" sizes="50vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
