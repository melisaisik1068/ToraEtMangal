import { redirect } from "next/navigation";

/** Genel QR pazarlama sayfası yok; masa QR’ları /qr/[numara] üzerinden çalışır. */
export default function QrInfoPage() {
  redirect("/");
}
