import { IMAGES } from "@/lib/images";

export const SITE_NAME = "TORA ET MANGAL";
export const SITE_TAGLINE = "Çiftlikten Soframıza";
export const SESSION_COOKIE = "tora_session";
export const CART_STORAGE_KEY = "tora-cart";
export const LOCAL_ORDERS_KEY = "tora-orders";
export const TABLE_COUNT = 20;

export const DONENESS_OPTIONS = [
  { value: "rare", label: "Az pişmiş" },
  { value: "medium", label: "Orta" },
  { value: "well", label: "İyi pişmiş" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Sipariş Alındı",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  READY: "Servise Hazır",
  SERVED: "Servis Edildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

export const TRACKING_STEPS = [
  { key: "PENDING", label: "Sipariş Alındı" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "COOKING", label: "Pişiriliyor" },
  { key: "READY", label: "Servise Hazır" },
] as const;

export const DEFAULT_SETTINGS = {
  id: "default",
  name: SITE_NAME,
  phone: process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "+905551112233",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "905551112233",
  address: "TORA ET MANGAL, İstanbul",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "https://instagram.com/toraetmangal",
  facebook: "",
  workingHours: JSON.stringify({
    weekdays: "11:00 – 00:00",
    weekend: "11:00 – 01:00",
  }),
  googleMapsUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ?? "https://maps.google.com/?q=Istanbul",
  logo: "/images/logo/logo.png",
  homepageTagline: "En taze etler, özgün tarifler ve mangalın en lezzetli hali TORA ET MANGAL'da.",
  aboutText:
    "TORA ET MANGAL, seçkin etleri çiftlikten soframıza taşıyan, mangal kültürünü modern bir sunumla buluşturan premium bir steakhouse’tur.",
};

export const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/menu", label: "Menü" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/reservation", label: "Rezervasyon" },
  { href: "/contact", label: "İletişim" },
] as const;

export const FEATURED_FALLBACK_SLUGS = [
  "adana-kebap",
  "kuzu-pirzola",
  "tora-kofte",
  "kuzu-kaburga-kavurma",
];

export const GALLERY = [IMAGES.interior, IMAGES.grillEmbers, IMAGES.hero, IMAGES.tableSetting];
