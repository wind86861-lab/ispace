import type { SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { htmlLang } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ispace.uz";

/**
 * §13 — structured data. Server komponenti, JS bundle'ga hech narsa
 * qo'shmaydi. Kontent bitta manbadan olingani uchun sayt matni bilan
 * razmetka hech qachon bir-biridan ajralib qolmaydi.
 */
export function JsonLd({ locale, content }: { locale: Locale; content: SiteContent }) {
  const { contact, branches, products, faq } = content;
  const url = `${SITE}/${locale}`;

  const graph: unknown[] = [
    {
      "@type": "Organization",
      "@id": `${SITE}#organization`,
      name: "iSpace",
      url: SITE,
      logo: `${SITE}/images/logo.png`,
      foundingDate: "2007",
      sameAs: [contact.telegram, contact.instagram, contact.facebook, contact.youtube],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: contact.phoneHref.replace("tel:", ""),
          contactType: "sales",
          email: contact.email,
          areaServed: "UZ",
          availableLanguage: ["ru", "uz"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}#website`,
      url,
      name: "iSpace",
      inLanguage: htmlLang[locale],
      publisher: { "@id": `${SITE}#organization` },
    },
    ...branches.map((b) => ({
      "@type": "LocalBusiness",
      "@id": `${SITE}#branch-${b._id}`,
      name: `iSpace — ${pick(b.city, locale)}, ${pick(b.district, locale)}`,
      parentOrganization: { "@id": `${SITE}#organization` },
      telephone: b.phone,
      address: {
        "@type": "PostalAddress",
        addressCountry: "UZ",
        addressLocality: pick(b.city, locale),
        addressRegion: pick(b.district, locale),
        streetAddress: pick(b.address, locale),
      },
      geo: { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng },
      hasMap: b.mapsUrl,
    })),
    ...products.map((p) => ({
      "@type": "Product",
      "@id": `${SITE}#product-${p.slug}`,
      name: pick(p.title, locale),
      image: `${SITE}${p.images[0].src}`,
      brand: { "@type": "Brand", name: "iSpace" },
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: p.currency,
        availability: "https://schema.org/InStock",
        seller: { "@id": `${SITE}#organization` },
      },
    })),
    {
      "@type": "FAQPage",
      "@id": `${SITE}#faq`,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: pick(item.question, locale),
        acceptedAnswer: { "@type": "Answer", text: pick(item.answer, locale) },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Kontent bizniki va statik — foydalanuvchi kiritmasi emas.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
