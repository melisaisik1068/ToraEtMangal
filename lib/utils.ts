import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseTableParam(value: string): number | null {
  if (!/^\d{1,3}$/.test(value)) return null;
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number < 1 || number > 999) return null;
  return number;
}

export function siteUrl(path = "") {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  const base = raw.replace(/\/$/, "");
  const suffix = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix || "/"}`;
}

export function whatsappLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

/** Ensures external links work even if https:// was omitted in env/admin. */
export function ensureAbsoluteUrl(value: string | null | undefined, fallback = "") {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("//")) {
    return raw.startsWith("//") ? `https:${raw}` : raw;
  }
  return `https://${raw.replace(/^\/+/, "")}`;
}
