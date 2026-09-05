import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang } from "@/i18n/routing";
import { getContent } from "@/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CompareBoard } from "@/components/catalog/CompareBoard";
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

  const t = await getTranslations({ locale, namespace: "compare" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: t("subtitle"),
    /*
     * Sahifa mazmuni foydalanuvchining o'z tanloviga bog'liq va u
     * `localStorage` da — qidiruv tizimi uchun bu yerda indekslanadigan
     * narsa yo'q.
     */
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/compare`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/compare`])),
        "x-default": `/${routing.defaultLocale}/compare`,
      },
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "compare" });
  const tb = await getTranslations({ locale, namespace: "branchesPage" });

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2rem)] pb-8">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: tb("home"), href: "/" }, { label: t("title") }]} />

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
        </div>
      </section>

      {/*
        Jadval — client komponent: tanlov `localStorage` da turadi.
        Katalog va kategoriyalar esa serverdan keladi, ya'ni ro'yxat
        admin o'zgartirgan mahsulotlarni ham ko'radi.
      */}
      <CompareBoard products={content.products} categories={content.categories} />

      {/* Maketdagidek: jadval ostida "tanlashga yordam kerakmi?" formasi. */}
      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
    </>
  );
}
