"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Post, PostCategory } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { DUR, EASE_LUX } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "./PostCard";

const TABS: PostCategory[] = ["all", "massage", "reviews", "health", "tips", "news"];

/**
 * Blog ro'yxati: kategoriya tablari va qidiruv.
 *
 * Filtr mijoz tomonida — maqolalar ro'yxati kichik va sahifa bilan birga
 * SSR'da keladi. Bosh sahifadagi blok bilan bir xil mantiq, lekin bu
 * yerda "yana ko'rsatish" cheklovi yo'q: bu sahifaning butun vazifasi —
 * hamma maqolani ko'rsatish.
 */
export function BlogView({ posts }: { posts: Post[] }) {
  const t = useTranslations("blog");
  const tp = useTranslations("blogPage");
  const locale = useLocale() as Locale;

  const [tab, setTab] = useState<PostCategory>("all");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((post) => {
        if (tab !== "all" && post.category !== tab) return false;
        if (!q) return true;
        return [pick(post.title, locale), pick(post.excerpt, locale)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [posts, tab, query, locale]);

  return (
    <>
      <Reveal className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label={tp("title")} className="flex flex-wrap gap-1.5">
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

      <Reveal delay={0.06}>
        <p aria-live="polite" className="mt-5 text-[14px] text-espresso-soft/85">
          {tp("found", { count: shown.length })}
        </p>
      </Reveal>

      {shown.length === 0 ? (
        <p className="mt-16 text-center font-display text-xl text-espresso">{t("empty")}</p>
      ) : (
        <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((post, i) => (
              <motion.li
                key={post._id}
                layout
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: DUR.reveal, ease: EASE_LUX }}
              >
                <PostCard
                  post={post}
                  locale={locale}
                  index={i}
                  labels={{
                    category: t(`tabs.${post.category}`),
                    readingTime: t("readingTime", { minutes: post.readingMinutes }),
                    readMore: t("readMore"),
                  }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </>
  );
}
