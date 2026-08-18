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
      <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-background-deep/20 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-8 pt-24 text-center">
        <p className="font-serif text-xs uppercase tracking-[0.32em] text-gold sm:text-sm">
          ÇİFTLİKTEN SOFRAMIZA
        </p>
        <h1 className="mt-2 font-script text-[2.75rem] leading-none text-cream sm:text-6xl">
          Lezzet yolculuğu
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-cream/85">
          En taze etler, usta eller ve eşsiz tariflerle mangalın en lezzetli hali.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-cream px-8 text-sm font-semibold tracking-wide text-primary-foreground"
        >
          MENÜYÜ İNCELE
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
