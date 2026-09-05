import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, htmlLang, type Locale } from "@/i18n/routing";
import { getContent } from "@/content";
import { products as seedProducts } from "@/content/products";
import { readCollection } from "@/lib/store";
import type { Product } from "@/content/types";
import { t as pick } from "@/lib/locale";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductStory } from "@/components/product/ProductStory";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reviews } from "@/components/sections/Reviews";
import { LeadForm } from "@/components/sections/LeadForm";

const listProducts = () => readCollection<Product>("products", seedProducts);

/**
 * Build vaqtida ma'lum bo'lgan mahsulotlar oldindan chiziladi.
 *
 * `dynamicParams` sukut bo'yicha yoqilgan, shuning uchun admin keyinroq
 * qo'shgan mahsulot ham ishlaydi: uning sahifasi birinchi so'rovda
 * server tomonda chiziladi. Ya'ni yangi mahsulot uchun qayta build
 * shart emas.
 */
export async function generateStaticParams() {
  const products = await listProducts();
  return routing.locales.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const product = (await listProducts()).find((p) => p.slug === slug);
  if (!product) return {};

  const meta = await getTranslations({ locale, namespace: "meta" });
  const title = pick(product.title, locale as Locale);

  return {
    title: `${title} — ${meta("siteName")}`,
    description: product.description
      ? pick(product.description, locale as Locale)
      : meta("description"),
    alternates: {
      canonical: `/${locale}/catalog/${slug}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [htmlLang[l], `/${l}/catalog/${slug}`]),
        ),
        "x-default": `/${routing.defaultLocale}/catalog/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      images: [{ url: product.images[0].src }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const product = content.products.find((p) => p.slug === slug);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: "product" });
  const tc = await getTranslations({ locale, namespace: "catalog" });

  const category = content.categories.find((c) => c.slug === product.category);
  const related = content.products
    .filter((p) => p._id !== product._id && p.category === product.category)
    .slice(0, 3);

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2rem)] pb-14">
        <div className="container-lux">
          <Breadcrumbs
            items={[
              { label: tc("home"), href: "/" },
              { label: tc("title"), href: "/catalog" },
              { label: pick(product.title, locale) },
            ]}
          />

          {/*
            Ustunlar nisbati: o'ng ustun 26rem edi va u SIQILIB qolardi —
            narx, rang, komplektatsiya, tugmalar va savdo maydonchalari
            bir joyga sig'masdi, foto esa ekranning uchdan ikkisini
            egallardi. Endi o'ng ustun kengroq va katta ekranda yana
            o'sadi; foto qolgan joyni oladi.
          */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
            <div>
              <Reveal variant="mask">
                <ProductGallery
                  images={product.images}
                  badges={content.badges.filter((b) => product.badgeIds?.includes(b._id))}
                  /* Xususiyatlar — rasm ostida va u bilan bir chiziqda. */
                  footer={<ProductFeatures features={product.features} locale={locale as Locale} />}
                />
              </Reveal>
            </div>

            <div>
              {category && (
                <Reveal>
                  <p className="text-[12px] tracking-[0.16em] text-espresso-soft/85 uppercase">
                    {pick(category.title, locale)}
                  </p>
                </Reveal>
              )}

              <SplitHeading
                as="h1"
                label={pick(product.title, locale)}
                className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15]"
              >
                {pick(product.title, locale)}
              </SplitHeading>

              <Reveal delay={0.1} className="mt-6 block">
                <BuyBox
                  product={{
                    _id: product._id,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    inStock: product.inStock,
                    colors: product.colors,
                    bundles: product.bundles,
                    marketplaces: product.marketplaces,
                  }}
                />
              </Reveal>
            </div>
          </div>

          <div className="mt-14">
            <ProductTabs product={product} />
          </div>
        </div>
      </section>

      {/*
        Hikoya bloklari — faqat rasmi yuklanganlari chiziladi.
        Hech biri yuklanmagan bo'lsa `ProductStory` `null` qaytaradi va
        sahifada bu joy umuman bo'lmaydi (bo'sh oraliq ham qolmaydi).
      */}
      {product.story && product.story.length > 0 && (
        <div className="pb-4">
          <ProductStory blocks={product.story} locale={locale} />
        </div>
      )}

      {related.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="container-lux">
            <Reveal>
              <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] text-espresso">
                {t("related")}
              </h2>
            </Reveal>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <li key={p._id}>
                  <ProductCard
                    product={p}
                    index={i}
                    badges={content.badges.filter((b) => p.badgeIds?.includes(b._id))}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
      <Reviews reviews={content.reviews} />

      {/* Qidiruv natijalarida narx va mavjudlik ko'rinsin. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: pick(product.title, locale),
            image: product.images.map((m) => m.src),
            description: product.description ? pick(product.description, locale) : undefined,
            brand: { "@type": "Brand", name: product.brand ?? "iSpace" },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: product.currency,
              availability:
                (product.inStock ?? true)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/PreOrder",
            },
            aggregateRating:
              product.rating != null && product.reviewCount != null
                ? {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount,
                  }
                : undefined,
          }),
        }}
      />
    </>
  );
}
