import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang } from "@/i18n/routing";
import { getContent } from "@/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewsView } from "@/components/reviews/ReviewsView";
import { LeadForm } from "@/components/sections/LeadForm";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "reviewsPage" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/reviews`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/reviews`])),
        "x-default": `/${routing.defaultLocale}/reviews`,
      },
    },
  };
}

/**
 * Sharhlar sahifasi.
 *
 * Ilgari sharhlar faqat bosh sahifadagi karuselda edi: u yerda beshtasi
 * ko'rinardi va qolganiga yo'l yo'q edi. Bu esa aynan sotuvga eng ko'p
 * ta'sir qiladigan kontent. Sahifa qolipi BLOG bilan bir xil — sarlavha,
 * tablar, qidiruv va uch ustunli panjara.
 */
export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "reviewsPage" });

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2rem)] pb-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("title") }]} />

          <SplitHeading
            as="h1"
            label={t("title")}
            className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1]"
          >
            {t("title")}
          </SplitHeading>

          <Reveal variant="smoke" delay={0.08}>
            <p className="measure mt-3 text-sm leading-relaxed text-espresso-soft">
              {t("subtitle")}
            </p>
          </Reveal>

          <div className="mt-9">
            <ReviewsView reviews={content.reviews} />
          </div>
        </div>
      </section>

      <LeadForm media={content.lead.image} contact={content.contact} trust={content.leadTrust} />
    </>
  );
}
