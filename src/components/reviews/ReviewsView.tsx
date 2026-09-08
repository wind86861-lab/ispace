"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Review } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { DUR, EASE_LUX } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard } from "./ReviewCard";
import { ReviewDialog } from "./ReviewDialog";
import { reviewMedia } from "./media";

/** Filtr kalitlari. `five`/`four` — reyting, `media` — foto yoki video. */
const TABS = ["all", "five", "four", "media"] as const;
type Tab = (typeof TABS)[number];

/**
 * Sharhlar ro'yxati — blog sahifasidagi ko'rinishning aynan qolipi:
 * tablar, qidiruv, topilganlar soni va uch ustunli panjara.
 *
 * Filtr MIJOZ tomonida: sharhlar ro'yxati kichik va sahifa bilan birga
 * SSR'da keladi, ya'ni har bosishda serverga borish keraksiz kechikish
 * bo'lardi.
 */
export function ReviewsView({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("reviews");
  const tp = useTranslations("reviewsPage");
  const locale = useLocale() as Locale;

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  /** Modalda ochilgan sharh. `null` — modal yopiq. */
  const [open, setOpen] = useState<Review | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (
      reviews
        .filter((r) => {
          /* Foto, yuklangan video yoki YouTube — barchasi "media". */
          const hasMedia = reviewMedia(r).length > 0;
          if (tab === "five" && r.rating !== 5) return false;
          if (tab === "four" && r.rating !== 4) return false;
          if (tab === "media" && !hasMedia) return false;
          if (!q) return true;
          return [pick(r.author, locale), pick(r.text, locale)]
            .join(" ")
            .toLowerCase()
            .includes(q);
        })
        /* Yangilari birinchi — eski sharh sahifaning boshida turmasin. */
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    );
  }, [reviews, tab, query, locale]);

  return (
    <>
      <Reveal className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label={tp("title")}
          className="flex flex-wrap gap-1.5"
        >
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
                {tp(`tabs.${key}`)}
              </button>
            );
          })}
        </div>

        <label className="relative lg:w-72">
          <span className="sr-only">{tp("searchAria")}</span>
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
            placeholder={tp("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-taupe/40 bg-warm-white pr-10 pl-10 text-[14px] text-espresso outline-none transition-colors duration-300 focus:border-gold"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={tp("empty")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-taupe-text transition-colors duration-300 hover:text-espresso"
            >
              <X size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          )}
        </label>
      </Reveal>

      <Reveal delay={0.06}>
        <p
          aria-live="polite"
          className="mt-5 text-[14px] text-espresso-soft/85"
        >
          {tp("found", { count: shown.length })}
        </p>
      </Reveal>

      {shown.length === 0 ? (
        <p className="font-display mt-16 text-center text-xl text-espresso">
          {tp("empty")}
        </p>
      ) : (
        <motion.ul
          layout
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {shown.map((review, i) => (
              <motion.li
                key={review._id}
                layout
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: DUR.reveal, ease: EASE_LUX }}
              >
                <ReviewCard
                  review={review}
                  locale={locale}
                  index={i}
                  onOpen={() => setOpen(review)}
                  labels={{
                    ratingAria: t("ratingAria", { rating: review.rating }),
                    verified: t("verified"),
                    photos: t("photosCount", {
                      count: reviewMedia(review).filter(
                        (i) => i.kind === "photo",
                      ).length,
                    }),
                    video: t("watchVideo"),
                    readMore: tp("readMore"),
                  }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <ReviewDialog
        review={open}
        locale={locale}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
