"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Media, Post, PostCategory } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { useMediaTier } from "@/hooks/useMediaTier";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { t as pick } from "@/lib/locale";
import { PostCard } from "@/components/blog/PostCard";
import { SmartMedia } from "@/components/ui/SmartMedia";

const AUTOPLAY_MS = 5200;

const TABS: PostCategory[] = ["all", "massage", "reviews", "health", "tips", "news"];

/**
 * Bosh sahifadagi blog bloki — BITTA qator.
 *
 * Ilgari bu yerda tablar, qidiruv va to'rt ustunli to'r bor edi. Endi
 * ularning hammasi `/blog` sahifasida: bosh sahifada takrorlash faqat
 * e'tiborni bo'lardi va sahifani cho'zardi.
 *
 * Qatorga sig'maydiganlar karusel bo'lib aylanadi. Karusel FAQAT
 * kartalar ko'rinadigandan ko'p bo'lsa yoqiladi — aks holda o'q
 * tugmalari bosilmaydigan bo'lib turardi va autoplay bekorga ishlardi.
 */
export function Blog({ posts, background }: { posts: Post[]; background?: Media }) {
  const t = useTranslations("blog");
  const locale = useLocale() as Locale;
  const { reduced } = useMediaTier();

  const [tab, setTab] = useState<PostCategory>("all");
  const [query, setQuery] = useState("");

  /*
   * Admin «bosh sahifada ko'rinsin» deb belgilaganlar. Hech biri
   * belgilanmagan bo'lsa blok bo'sh qolmasin — eng yangilari ko'rsatiladi.
   */
  const pool = useMemo(() => {
    const featured = posts.filter((p) => p.featured);
    return (featured.length > 0 ? featured : posts)
      .slice()
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, featured.length > 0 ? featured.length : 8);
  }, [posts]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((post) => {
      if (tab !== "all" && post.category !== tab) return false;
      if (!q) return true;
      return [pick(post.title, locale), pick(post.excerpt, locale)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [pool, tab, query, locale]);

  // Bir qatorga lg da 4 ta sig'adi.
  const scrollable = list.length > 4;

  const [emblaRef, embla] = useEmblaCarousel(
    { loop: scrollable, align: "start", containScroll: "trimSnaps", active: scrollable },
    scrollable && !reduced
      ? [Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })]
      : [],
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    sync();
    embla.on("select", sync).on("reInit", sync);
    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  if (pool.length === 0) return null;

  /*
   * Fon rasmi FAQAT admin uni haqiqatan yuklagan bo'lsa chiziladi
   * (`uploaded` ni `applyOverrides` qo'yadi). Aks holda bo'lim
   * hozirgidek tekis krem sirt bo'lib qoladi — bo'sh o'rindosh
   * gradientni ko'rsatgandan ko'ra shunisi to'g'ri.
   */
  const hasBackground = Boolean(background?.uploaded && background.src);

  return (
    <section
      id="blog"
      className="relative isolate scroll-mt-28 border-y border-taupe/25 bg-alabaster py-20 sm:py-24"
    >
      {hasBackground && background && (
        /*
          Lead bandidagi bilan BIR XIL mexanizm: ekran o'lchamidagi
          `fixed` qatlam + bo'lim chegarasi bo'yicha `clip`. Izohi
          `globals.css` dagi `bg-pinned-*` da.
        */
        <div aria-hidden="true" className="bg-pinned-frame pointer-events-none -z-10">
          <div className="bg-pinned-layer">
            {/* Fon ham rasm, ham video bo'lishi mumkin — uyasi `media`. */}
            <SmartMedia media={background} locale={locale} sizes="100vw" />
          </div>
          <div className="blog-veil absolute inset-0" />
        </div>
      )}

      <div className="container-lux">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        {/* ---- tablar va qidiruv (maketdagidek) ---- */}
        <Reveal className="mt-9 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label={t("title")} className="flex flex-wrap gap-1.5">
            {TABS.map((key) => {
              const on = key === tab;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setTab(key)}
                  className={[
                    "rounded-full border px-4 py-2 text-[13px] transition-colors duration-300",
                    on
                      ? "border-gold/60 bg-gold/12 text-gold-ink"
                      : "border-taupe/40 bg-warm-white text-espresso-soft hover:border-gold/50 hover:text-espresso",
                  ].join(" ")}
                >
                  {t(`tabs.${key}`)}
                </button>
              );
            })}
          </div>

          <label className="relative lg:w-72">
            <span className="sr-only">{t("searchAria")}</span>
            <Search
              size={15}
              strokeWidth={1.6}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-taupe-text"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 w-full rounded-full border border-taupe/40 bg-warm-white pr-10 pl-10 text-[14px] text-espresso outline-none transition-colors duration-300 focus:border-gold"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("empty")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-taupe-text transition-colors duration-300 hover:text-espresso"
              >
                <X size={14} strokeWidth={1.8} aria-hidden="true" />
              </button>
            )}
          </label>
        </Reveal>

        {list.length === 0 ? (
          <p className="py-16 text-center text-sm text-espresso-soft">{t("empty")}</p>
        ) : (
        <div className="mt-8 overflow-hidden" ref={emblaRef}>
          {/*
            `flex` + sobit kenglikdagi slaydlar: karusel o'chirilganda ham
            bu oddiy bir qatorli tarash bo'lib qoladi, ya'ni ikkita alohida
            maket kerak emas.
          */}
          <ul className="flex gap-5">
            {list.map((post, i) => (
              <li
                key={post._id}
                className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-[48%] lg:basis-[calc((100%-3.75rem)/4)]"
              >
                <PostCard
                  post={post}
                  locale={locale}
                  index={i}
                  reveal={false}
                  labels={{
                    category: t(`tabs.${post.category}`),
                    readingTime: t("readingTime", { minutes: post.readingMinutes }),
                    readMore: t("readMore"),
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
        )}

        <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {scrollable && (
            <span className="flex gap-2">
              <CarouselButton label={t("readMore")} onClick={prev} disabled={!canPrev}>
                <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
              </CarouselButton>
              <CarouselButton label={t("readMore")} onClick={next} disabled={!canNext}>
                <ArrowRight size={16} strokeWidth={1.7} aria-hidden="true" />
              </CarouselButton>
            </span>
          )}

          <Magnetic strength={0.25}>
            <Link
              href="/blog"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-taupe/70 bg-warm-white px-5 text-sm font-medium text-espresso transition-[background-color,border-color,color] duration-300 hover:border-gold hover:text-gold-deep"
            >
              {t("viewAll")}
              <ArrowRight
                size={16}
                strokeWidth={1.75}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full border border-taupe/50 text-espresso-soft transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
