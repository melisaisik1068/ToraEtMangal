import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE_NAME } from "@/lib/constants";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const greatVibes = Great_Vibes({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-great-vibes",
});

function metadataBaseUrl() {
  try {
    return new URL(siteUrl());
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a1812",
};

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: `${SITE_NAME} | Çiftlikten Soframıza`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Taze etler, usta eller ve eşsiz mangal lezzetleri. TORA ET MANGAL dijital menüsünü keşfedin.",
  openGraph: {
    title: `${SITE_NAME} | Çiftlikten Soframıza`,
    description:
      "Taze etler, usta eller ve eşsiz mangal lezzetleri. TORA ET MANGAL dijital menüsünü keşfedin.",
    locale: "tr_TR",
    type: "website",
    images: ["/images/logo/logo.png"],
  },
  icons: {
    icon: "/images/logo/logo.png",
    apple: "/images/logo/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${manrope.variable} ${cormorant.variable} ${greatVibes.variable} h-full antialiased`}>
      <body className="min-h-full bg-background-deep font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
