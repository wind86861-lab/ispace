import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang } from "@/i18n/routing";
import { getContent } from "@/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Reviews } from "@/components/sections/Reviews";
import { LeadForm } from "@/components/sections/LeadForm";
import { Faq } from "@/components/sections/Faq";

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

  const t = await getTranslations({ locale, namespace: "catalog" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: meta("description"),
    alternates: {
      canonical: `/${locale}/catalog`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/catalog`])),
        "x-default": `/${routing.defaultLocale}/catalog`,
      },
    },
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "catalog" });

  return (
    <>
      {/*
        `pt` header balandligini hisobga oladi: header `fixed`, ya'ni u
        oqimdan chiqib ketgan va sahifa tepasi uning ostiga tushib qolardi.
      */}
      <section className="pt-[calc(var(--header-h)+2rem)] pb-14">
        <div className="container-lux">
          <Breadcrumbs
            items={[{ label: t("home"), href: "/" }, { label: t("title") }]}
          />

          {/* Alohida sahifa — sarlavha `h1` bo'lishi kerak; `SplitHeading`
              sukut bo'yicha `h2` chizadi (bosh sahifadagi bo'limlar uchun). */}
          <SplitHeading
            as="h1"
            label={t("title")}
            className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1]"
          >
            {t("title")}
          </SplitHeading>

          <div className="mt-8">
            <CatalogView
              products={content.products}
              badges={content.badges}
              categories={content.categories.filter((c) =>
                content.products.some((p) => p.category === c.slug),
              )}
            />
          </div>
        </div>
      </section>

      <Reviews reviews={content.reviews} />
      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
      <Faq faq={content.faq} />
    </>
  );
}
