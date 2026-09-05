import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Clock } from "lucide-react";
import { routing, htmlLang, type Locale } from "@/i18n/routing";
import { getContent } from "@/content";
import { posts as seedPosts } from "@/content/posts";
import { readCollection } from "@/lib/store";
import type { Post } from "@/content/types";
import { t as pick } from "@/lib/locale";
import { formatDate } from "@/lib/format";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PostBody } from "@/components/blog/PostBody";
import { PostCard } from "@/components/blog/PostCard";
import { PostToc } from "@/components/blog/PostToc";
import { buildToc } from "@/components/blog/toc";
import { LeadForm } from "@/components/sections/LeadForm";

const listPosts = () => readCollection<Post>("posts", seedPosts);

/**
 * Ma'lum maqolalar oldindan chiziladi; `dynamicParams` yoqilgani uchun
 * admin keyinroq qo'shgani ham qayta build'siz ishlaydi.
 */
export async function generateStaticParams() {
  const posts = await listPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const post = (await listPosts()).find((p) => p.slug === slug);
  if (!post) return {};

  const meta = await getTranslations({ locale, namespace: "meta" });
  const title = pick(post.title, locale as Locale);

  return {
    title: `${title} — ${meta("siteName")}`,
    description: pick(post.excerpt, locale as Locale),
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], `/${l}/blog/${slug}`])),
        "x-default": `/${routing.defaultLocale}/blog/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description: pick(post.excerpt, locale as Locale),
      publishedTime: post.publishedAt,
      images: [{ url: post.cover.src }],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const content = await getContent();
  const post = content.posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "post" });
  const tb = await getTranslations({ locale, namespace: "blog" });
  const tp = await getTranslations({ locale, namespace: "blogPage" });

  // Avval o'sha rukndagilar, yetmasa qolganlari — «Читайте также» hech
  // qachon bo'sh qolmasin.
  const others = content.posts.filter((p) => p._id !== post._id);
  const related = [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);

  return (
    <>
      <article className="pt-[calc(var(--header-h)+2rem)] pb-16">
        <div className="container-lux">
          <Breadcrumbs
            items={[
              { label: tp("home"), href: "/" },
              { label: tp("title"), href: "/blog" },
              { label: pick(post.title, locale) },
            ]}
          />

          {/*
            Sarlavha bloki — ikki ustun: chapda muqova, o'ngda matn.

            Ilgari muqova sarlavhadan KEYIN, butun kenglikda turardi va
            o'quvchi maqola nima haqidaligini bilishdan oldin katta
            rasmni bosib o'tishi kerak edi. Endi rasm va kirish matni
            bir ekranda: mavzu ham, kayfiyat ham darrov o'qiladi.
          */}
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12">
            <Reveal variant="mask" className="lg:sticky lg:top-28">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
                <Image
                  src={post.cover.src}
                  alt={pick(post.cover.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  priority
                  sizes="(max-width: 1024px) 100vw, 26rem"
                  style={mediaFit(post.cover).style}
                  className={mediaFit(post.cover).className}
                />
              </div>
            </Reveal>

            <header className="min-w-0">
              <Reveal className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-rosewood/30 bg-rosewood/8 px-3.5 py-1.5 text-[12px] tracking-[0.1em] text-rosewood uppercase">
                  {tb(`tabs.${post.category}`)}
                </span>
                <time dateTime={post.publishedAt} className="text-[13px] text-espresso-soft/85">
                  {formatDate(post.publishedAt, locale)}
                </time>
              </Reveal>

              <SplitHeading
                as="h1"
                label={pick(post.title, locale)}
                className="mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.15]"
              >
                {pick(post.title, locale)}
              </SplitHeading>

              <Reveal delay={0.06}>
                <p className="mt-4 inline-flex items-center gap-2 text-[13px] text-espresso-soft/85">
                  <Clock size={14} strokeWidth={1.6} aria-hidden="true" className="text-gold" />
                  {tb("readingTime", { minutes: post.readingMinutes })}
                </p>
              </Reveal>

              <Reveal variant="smoke" delay={0.1}>
                <p className="mt-5 text-[16px] leading-relaxed text-espresso-soft">
                  {pick(post.excerpt, locale)}
                </p>
              </Reveal>

              {/* Mundarija matndagi sarlavhalardan o'zi yig'iladi. */}
              <Reveal delay={0.16} className="mt-7 block">
                <PostToc items={buildToc(post.body, locale)} />
              </Reveal>
            </header>
          </div>

          {/* --- matn --- */}
          {post.body && post.body.length > 0 && (
            <div className="mx-auto mt-10 max-w-[46rem]">
              <PostBody blocks={post.body} locale={locale} />
            </div>
          )}

          <div className="mx-auto mt-12 max-w-[46rem] border-t border-taupe/30 pt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[14px] text-espresso-soft transition-colors duration-300 hover:text-gold-ink"
            >
              <ArrowLeft size={15} strokeWidth={1.6} aria-hidden="true" />
              {t("backToBlog")}
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-warm-white py-16 sm:py-20">
          <div className="container-lux">
            <Reveal>
              <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] text-espresso">
                {t("related")}
              </h2>
            </Reveal>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <li key={p._id}>
                  <PostCard
                    post={p}
                    locale={locale}
                    index={i}
                    labels={{
                      category: tb(`tabs.${p.category}`),
                      readingTime: tb("readingTime", { minutes: p.readingMinutes }),
                      readMore: tb("readMore"),
                    }}
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

      {/* Qidiruv natijasida sana va muqova ko'rinsin. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: pick(post.title, locale),
            description: pick(post.excerpt, locale),
            image: [post.cover.src],
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: "iSpace" },
            publisher: { "@type": "Organization", name: "iSpace" },
          }),
        }}
      />
    </>
  );
}
