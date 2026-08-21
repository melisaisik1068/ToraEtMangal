import { Instagram, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getSettings } from "@/lib/services/catalog";
import { telLink, whatsappLink } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/menu", label: "Menü" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/reservation", label: "Rezervasyon" },
  { href: "/contact", label: "İletişim" },
];

export async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="mt-16 border-t border-gold/15 bg-background-deep pb-28 lg:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <BrandLogo size={92} />
          <p className="mt-3 font-serif text-xl italic text-gold">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Hızlı bağlantılar</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 text-sm text-muted">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">İletişim</p>
          <a className="flex min-h-11 items-center gap-2 hover:text-cream" href={telLink(settings.phone)}>
            <Phone className="h-4 w-4 text-gold" /> {settings.phone}
          </a>
          <a className="flex min-h-11 items-center gap-2 hover:text-cream" href={settings.googleMapsUrl}>
            <MapPin className="h-4 w-4 text-gold" /> {settings.address}
          </a>
          <a className="flex min-h-11 items-center gap-2 hover:text-cream" href={settings.instagram}>
            <Instagram className="h-4 w-4 text-gold" /> Instagram
          </a>
          <a className="flex min-h-11 items-center gap-2 hover:text-cream" href={whatsappLink(settings.whatsapp)}>
            WhatsApp
          </a>
        </div>
      </div>
      <p className="border-t border-gold/10 py-5 text-center text-xs text-muted">
        © 2026 {SITE_NAME}. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
