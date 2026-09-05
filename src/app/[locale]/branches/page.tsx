import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang } from "@/i18n/routing";
import { getContent } from "@/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BranchDetail } from "@/components/branches/BranchDetail";
import { Branches } from "@/components/sections/Branches";
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

  const t = await getTranslations({ locale, namespace: "branchesPage" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/branches`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/branches`])),
        "x-default": `/${routing.defaultLocale}/branches`,
      },
    },
  };
}

export default async function BranchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "branchesPage" });

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2rem)] pb-10">
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
        </div>
      </section>

      {/* Xarita va ro'yxat — bosh sahifadagi bo'lim bilan bir xil vosita. */}
      <Branches branches={content.branches} />

      {/*
        Tanlangan filial: kontaktlar, foto va joylashuv. Tanlov shu
        komponent ichida — sahifada ikkita mustaqil tanlov bo'lmasligi
        uchun (yuqoridagi xarita o'z ko'rsatkichini o'zi boshqaradi).
      */}
      <section className="pb-16">
        <div className="container-lux">
          <BranchDetail branches={content.branches} />
        </div>
      </section>

      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
      <Faq faq={content.faq} />
    </>
  );
}
