import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { routing, htmlLang, type Locale } from "@/i18n/routing";
import { getContent } from "@/content";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { MotionBoot } from "@/components/layout/MotionBoot";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Overlays } from "@/components/overlays/Overlays";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

/**
 * §6 — Kirill (ru) va lotin-kengaytirilgan (uz dagi `ʻ`) subsetlari
 * majburiy. Ularsiz ruscha matn tizim shriftiga tushib ketadi.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

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

  const t = await getTranslations({ locale, namespace: "meta" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ispace.uz";

  return {
    metadataBase: new URL(base),
    title: t("title"),
    description: t("description"),
    // §13 — hreflang: uchala til + x-default.
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}`])),
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
      locale: htmlLang[locale as Locale].replace("-", "_"),
      url: `/${locale}`,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: t("siteName") }],
    },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const content = await getContent();
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={htmlLang[locale]}
      className={`${cormorant.variable} ${manrope.variable}`}
      /**
       * Bo'yashdan oldingi skript `<html>` ga `data-motion` va
       * `data-preloader` qo'yadi, Lenis esa `lenis` klassini qo'shadi —
       * ya'ni server chizgan `<html>` client'dagidan farq qiladi. Bu
       * ataylab qilingan (§4/§5: FOUC bo'lmasligi uchun), shuning uchun
       * React'ning hydration ogohlantirishi aynan shu elementda o'chiriladi.
       * Ogohlantirish faqat shu tegga taalluqli — bolalari tekshirilaveradi.
       */
      suppressHydrationWarning
    >
      <body className="bg-cream text-espresso-soft antialiased">
        {/* Bo'yashdan oldingi boshlang'ich skript — izohi komponentda. */}
        <MotionBoot />

        <NextIntlClientProvider>
          <StoreProvider>
            <LenisProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-espresso focus:px-5 focus:py-3 focus:text-cream"
              >
                {t("skipToContent")}
              </a>

              <Preloader />
              <Header nav={content.nav} contact={content.contact} />
              <main id="main">{children}</main>
              <Footer nav={content.nav} contact={content.contact} branches={content.branches} />
              <FloatingActions contact={content.contact} />
              <Overlays
                products={content.products}
                /* Yuklanmagan bo'lsa `undefined` — lightbox YouTube'ga tushadi. */
                videoFile={
                  content.about.video.file?.uploaded ? content.about.video.file.src : undefined
                }
              />
            </LenisProvider>
          </StoreProvider>
        </NextIntlClientProvider>

        <JsonLd locale={locale} content={content} />
      </body>
    </html>
  );
}
