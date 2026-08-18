import { ChefHat, QrCode, Wheat } from "lucide-react";

const FEATURES = [
  {
    icon: Wheat,
    title: "Çiftlikten Doğal Et",
    text: "Seçkin etleri özenle hazırlıyoruz.",
  },
  {
    icon: ChefHat,
    title: "Usta Ellerle Hazırlanan Lezzet",
    text: "Mangal kültürünü modern sunumla buluşturuyoruz.",
  },
  {
    icon: QrCode,
    title: "QR ile Kolay Menü",
    text: "Masanızdaki kodu okutarak menüye anında ulaşın.",
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-4 py-8 md:gap-6 md:py-12">
      {FEATURES.map((feature) => (
        <article key={feature.title} className="flex flex-col items-center px-1 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/70 text-gold md:h-20 md:w-20">
            <feature.icon className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="mt-3 font-serif text-sm leading-snug md:text-xl">{feature.title}</h2>
          <p className="mt-1 hidden text-sm leading-6 text-muted md:block">{feature.text}</p>
        </article>
      ))}
    </section>
  );
}
