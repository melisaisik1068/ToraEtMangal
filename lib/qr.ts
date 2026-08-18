import QRCode from "qrcode";
import { siteUrl } from "@/lib/utils";

export async function generateTableQrDataUrl(tableNumber: number) {
  return QRCode.toDataURL(siteUrl(`/qr/${tableNumber}`), {
    margin: 1,
    width: 360,
    errorCorrectionLevel: "M",
    color: { dark: "#0D352D", light: "#FFF6DC" },
  });
}
