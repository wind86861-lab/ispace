import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang } from "@/i18n/routing";
import { getContent } from "@/content";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Reveal } from "@/components/ui/Reveal";
import { AboutIntro } from "@/components/about/AboutIntro";
import { MediaRow } from "@/components/about/MediaRow";
import { PlayVideoButton } from "@/components/about/PlayVideoButton";
import { Advantages } from "@/components/sections/Advantages";
import { Partners } from "@/components/sections/Partners";
import { Blog } from "@/components/sections/Blog";
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

  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} — ${meta("siteName")}`,
    description: meta("description"),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/about`])),
        "x-default": `/${routing.defaultLocale}/about`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const { about } = content;

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2rem)] pb-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("title") }]} />

          <div className="mt-8">
            <AboutIntro about={about} locale={locale} title={t("title")} />
          </div>

          <div className="mt-16 sm:mt-20">
            <MediaRow items={about.gallery} locale={locale} title={t("gallery")} />
          </div>

          {/*
            Sertifikatlar — faqat yuklanganlari. Bittasi ham yuklanmagan
            bo'lsa `MediaRow` `null` qaytaradi va sahifada bu joy umuman
            bo'lmaydi (bo'sh oraliq ham qolmaydi).
          */}
          <div className="mt-16 sm:mt-20">
            <MediaRow
              items={about.certificates ?? []}
              locale={locale}
              title={t("certificates")}
              ratio="aspect-[3/4]"
              columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
              requireUploaded
            />
          </div>
        </div>
      </section>

      {/* --- katta video --- */}
      {/*
        Bo'lim tekis alabaster to'rtburchak edi: sarlavha, matn va
        kulrang muqova — hech qanday chuqurlik yo'q. Endi ostida
        «Kompaniya haqida» dagi bilan bir xil yumshoq yorug'lik dog'i
        turadi, muqova esa karta bo'lib ko'tariladi.
      */}
      <section className="relative isolate border-y border-taupe/30 bg-alabaster py-20 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="about-aura absolute inset-[-10%]" />
        </div>

        <div className="container-lux">
          <div className="mx-auto max-w-[56rem] text-center">
            <Reveal>
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] text-espresso">
                {t("videoTitle")}
              </h2>
            </Reveal>
            <Reveal variant="smoke" delay={0.08}>
              <p className="measure mx-auto mt-3 text-sm leading-relaxed text-espresso-soft">
                {t("videoText")}
              </p>
            </Reveal>
          </div>

          <Reveal variant="mask" className="relative mx-auto mt-10 block max-w-[64rem]">
            {/* Karta ortidagi iliq nur — soyaga rang beradi, sovuq emas. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 -bottom-4 -z-10 h-20 rounded-full bg-gold/25 blur-2xl"
            />

            <div className="group relative aspect-video overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_34px_70px_-30px_rgba(41,34,30,0.4)] transition-shadow duration-700 hover:shadow-[0_44px_86px_-30px_rgba(41,34,30,0.5)]">
              <Image
                src={about.video.poster.src}
                alt={pick(about.video.poster.alt, locale)}
                fill
                quality={IMAGE_QUALITY}
                sizes="(max-width: 1024px) 100vw, 64rem"
                style={mediaFit(about.video.poster).style}
                className={`${mediaFit(about.video.poster).className} transition-transform duration-[1100ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.04]`}
              />
              {/* Ochish tugmasi — client, chunki u overlay holatini o'zgartiradi. */}
              <PlayVideoButton label={pick(about.video.title, locale)} />
            </div>
          </Reveal>
        </div>
      </section>

      <Advantages advantages={content.advantages} />
      <Partners partners={content.partners} />
      <Blog posts={content.posts} background={content.blog.background} />
      <Faq faq={content.faq} />
      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
    </>
  );
}
