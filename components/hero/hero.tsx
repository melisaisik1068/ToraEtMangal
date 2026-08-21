import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/lib/images";

export async function Hero() {
  return (
    <section className="relative aspect-[3/4] min-h-[520px] overflow-hidden sm:aspect-auto sm:min-h-[72vh]">
      <Image
        src={IMAGES.hero}
        alt="Mangalda pişen premium et"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-ink)] via-[rgba(10,24,18,0.55)] to-[rgba(4,12,9,0.35)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,107,82,0.25),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-8 pt-24 text-center">
        <p className="font-serif text-xs uppercase tracking-[0.32em] text-gold sm:text-sm">
          ÇİFTLİKTEN SOFRAMIZA
        </p>
        <h1 className="mt-2 font-script text-[2.75rem] leading-none text-brand-glow sm:text-6xl">
          Lezzet yolculuğu
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-cream/90">
          En taze etler, usta eller ve eşsiz tariflerle mangalın en lezzetli hali.
        </p>
        <Link
          href="/menu"
          className="btn-brand mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold tracking-wide"
        >
          MENÜYÜ İNCELE
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
