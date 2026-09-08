import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang } from "@/i18n/routing";
import { getContent } from "@/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClientsHero } from "@/components/clients/ClientsHero";
import { ServiceRail } from "@/components/clients/ServiceRail";
import { Installment } from "@/components/clients/Installment";
import { Faq } from "@/components/sections/Faq";
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

  const t = await getTranslations({ locale, namespace: "clientsPage" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/clients`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/clients`])),
        "x-default": `/${routing.defaultLocale}/clients`,
      },
    },
  };
}

/**
 * «Mijozlarga» — xarid shartlari bitta sahifada.
 *
 * Ilgari navbardagi bu band FAQ langariga olib borardi: shartlar
 * sayt bo'ylab tarqoq edi va test-drayv, muddatli to'lov haqida
 * to'liq ma'lumot hech qayerda yo'q edi.
 *
 * Sahifa ritmi ataylab uch bosqichli:
 *   1. va’da (sarlavha va raqamlar chizig'i),
 *   2. tafsilot (yopishqoq media bilan to'rt bo'lim),
 *   3. qaror (kalkulyator va filiallar) — undan keyin savol va forma.
 */
export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "clientsPage" });

  return (
    <>
      <div className="container-lux pt-[calc(var(--header-h)+1.5rem)]">
        <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("eyebrow") }]} />
      </div>

      <ClientsHero services={content.services} />

      <ServiceRail services={content.services} />

      <Installment products={content.products} />

      <Faq faq={content.faq} />

      <LeadForm media={content.lead.image} contact={content.contact} trust={content.leadTrust} />
    </>
  );
}
