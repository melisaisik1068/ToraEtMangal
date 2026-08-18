import { Instagram, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/services/catalog";
import { telLink } from "@/lib/utils";

export async function HomeContactBar() {
  const settings = await getSettings();

  const items = [
    { href: telLink(settings.phone), icon: Phone, label: "BİZİ ARA" },
    { href: settings.googleMapsUrl, icon: MapPin, label: "YOL TARİFİ", external: true },
    { href: settings.instagram, icon: Instagram, label: "INSTAGRAM", external: true },
  ];

  return (
    <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-gold/20 bg-background-deep/98 backdrop-blur">
      <ul className="grid grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <a
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-[0.14em] text-cream"
              >
                <Icon className="h-5 w-5 text-gold" />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
