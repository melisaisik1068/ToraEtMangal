import { Instagram, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/services/catalog";
import { telLink, whatsappLink } from "@/lib/utils";

export const metadata = { title: "İletişim" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  const hours = JSON.parse(settings.workingHours) as { weekdays: string; weekend: string };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">İLETİŞİM</p>
      <h1 className="mt-2 font-serif text-4xl">Bize ulaşın</h1>
      <div className="mt-8 space-y-4 text-sm">
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gold" /> {settings.phone}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" /> {settings.address}
        </p>
        <p className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-gold" /> {settings.instagram}
        </p>
        <p className="text-muted">Hafta içi: {hours.weekdays}</p>
        <p className="text-muted">Hafta sonu: {hours.weekend}</p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <a className="flex min-h-12 items-center justify-center rounded-full bg-gold text-sm font-semibold text-primary-foreground" href={telLink(settings.phone)}>
          ARA
        </a>
        <a
          className="flex min-h-12 items-center justify-center rounded-full border border-gold/40 text-sm"
          href={whatsappLink(settings.whatsapp, "Merhaba, TORA ET MANGAL")}
        >
          WHATSAPP&apos;TAN YAZ
        </a>
        <a className="flex min-h-12 items-center justify-center rounded-full border border-gold/40 text-sm" href={settings.googleMapsUrl} target="_blank" rel="noreferrer">
          YOL TARİFİ AL
        </a>
      </div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-gold/20">
        <iframe
          title="Google Harita"
          src="https://maps.google.com/maps?q=Istanbul&t=&z=13&ie=UTF8&iwloc=&output=embed"
          className="h-72 w-full"
        />
      </div>
    </div>
  );
}
