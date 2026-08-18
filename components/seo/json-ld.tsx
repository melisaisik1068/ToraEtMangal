import { SITE_NAME } from "@/lib/constants";
import { getSettings } from "@/lib/services/catalog";
import { siteUrl } from "@/lib/utils";

export async function JsonLd() {
  const settings = await getSettings();
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.name || SITE_NAME,
    image: siteUrl("/images/logo/logo.png"),
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "TR",
    },
    servesCuisine: ["Turkish", "Steakhouse", "Mangal"],
    url: siteUrl(),
    menu: siteUrl("/menu"),
    acceptsReservations: "True",
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
