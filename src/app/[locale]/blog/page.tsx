import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang, type Locale } from "@/i18n/routing";
import { getContent } from "@/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartMedia } from "@/components/ui/SmartMedia";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BlogView } from "@/components/blog/BlogView";
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

  const t = await getTranslations({ locale, namespace: "blogPage" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/blog`])),
        "x-default": `/${routing.defaultLocale}/blog`,
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "blogPage" });

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

          {/*
            Banner — sarlavha bilan maqolalar orasida.

            Faqat admin fayl yuklagan bo'lsa chiziladi (`uploaded` ni
            `applyOverrides` qo'yadi): bo'sh ramka yoki o'rindosh
            gradient sahifaga chiqmaydi. Rasm ham, video ham bo'lishi
            mumkin — `SmartMedia` kengaytmaga qarab hal qiladi.
          */}
          {content.blog.banner.uploaded && (
            <Reveal variant="mask" delay={0.12}>
              <div className="relative mt-9 aspect-[3/1] w-full overflow-hidden rounded-3xl border border-taupe/25 bg-cream">
                <SmartMedia
                  media={content.blog.banner}
                  locale={locale as Locale}
                  sizes="(max-width: 1280px) 100vw, 1200px"
                />
              </div>
            </Reveal>
          )}

          <div className="mt-9">
            <BlogView posts={content.posts} />
          </div>
        </div>
      </section>

      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
    </>
  );
}
