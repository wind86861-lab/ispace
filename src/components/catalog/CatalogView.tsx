"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Badge, Category, Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_LUX } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "./ProductCard";
import { ICONS } from "@/components/ui/icons";
import { useMediaTier } from "@/hooks/useMediaTier";

type Sort = "popular" | "priceAsc" | "priceDesc" | "newest";

const SORTS: Sort[] = ["popular", "priceAsc", "priceDesc", "newest"];

/**
 * Katalog: kategoriya chiplari, narx oralig'i va saralash.
 *
 * Filtrlar mijoz tomonida: mahsulotlar ro'yxati kichik va u sahifa bilan
 * birga SSR'da keladi, shuning uchun har filtrda serverga borish faqat
 * kechikish qo'shardi. Ro'yxat kattalashsa bu joy server komponentiga
 * ko'chiriladi — `products` propi allaqachon tashqaridan beriladi.
 */
export function CatalogView({
  products,
  categories,
  badges = [],
}: {
  products: Product[];
  categories: Category[];
  /** Barcha nishonlar; har karta o'zinikini `badgeIds` bo'yicha oladi. */
  badges?: Badge[];
}) {
  const t = useTranslations("catalog");
  const tp = useTranslations("products");
  const locale = useLocale() as Locale;
  const { reduced } = useMediaTier();

  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [openFilters, setOpenFilters] = useState(false);

  /** Narx oralig'i — mavjud mahsulotlardan hisoblanadi, qo'lda yozilmaydi. */
  const bounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const [range, setRange] = useState<[number, number]>([bounds.min, bounds.max]);

  const shown = useMemo(() => {
    const list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        p.price >= range[0] &&
        p.price <= range[1],
    );

    const sorted = [...list];
    if (sort === "priceAsc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "newest") sorted.sort((a, b) => Number(b.isNew ?? 0) - Number(a.isNew ?? 0) || a.rank - b.rank);
    else sorted.sort((a, b) => a.rank - b.rank);
    return sorted;
  }, [products, category, range, sort]);

  /*
   * Chiplar ro'yxati: "Hammasi" + kategoriyalar, har birida mahsulot
   * soni. Son BUTUN katalogdan hisoblanadi, narx filtridan emas —
   * aks holda ползунок surilganda raqamlar sakrab, chiplar
   * o'lchamini o'zgartirib yuborardi.
   */
  const chips = useMemo(
    () => [
      { id: "all", label: t("all"), icon: undefined, count: products.length },
      ...categories.map((c) => ({
        id: c.slug,
        label: pick(c.title, locale),
        icon: c.icon,
        count: products.filter((p) => p.category === c.slug).length,
      })),
    ],
    [categories, products, locale, t],
  );

  const dirty = category !== "all" || range[0] !== bounds.min || range[1] !== bounds.max;

  const reset = () => {
    setCategory("all");
    setRange([bounds.min, bounds.max]);
  };

  return (
    <>
      {/*
        --- kategoriya chiplari ---

        Har chipda uchta narsa: belgi, nom va SHU kategoriyadagi
        mahsulotlar soni. Son muhim — foydalanuvchi bosishdan oldin
        u yerda nima borligini biladi va bo'sh bo'limga tushmaydi.

        Faol fonni `layoutId` ko'chiradi: u bir chipdan ikkinchisiga
        suzib o'tadi. Har chipga alohida `background` berilsa, u
        birida so'nib, ikkinchisida paydo bo'lardi — ko'z bog'lanishni
        yo'qotadi.
      */}
      <Reveal>
        <ul className="flex flex-wrap gap-2">
          {chips.map((c, i) => {
            const active = category === c.id;
            const Icon = c.icon ? ICONS[c.icon] : LayoutGrid;
            return (
              <motion.li
                key={c.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE_LUX }}
              >
                <button
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={[
                    "group relative flex items-center gap-2.5 rounded-full border px-4 py-2.5",
                    "transition-[border-color,color,transform,box-shadow] duration-300",
                    "ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-0.5",
                    active
                      ? "border-gold/60 text-gold-ink shadow-[0_10px_24px_-16px_rgba(41,34,30,0.5)]"
                      : "border-taupe/40 bg-warm-white text-espresso-soft hover:border-gold/50 hover:text-espresso",
                  ].join(" ")}
                >
                  {active && !reduced && (
                    <motion.span
                      layoutId="catalog-chip"
                      aria-hidden="true"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-full bg-gold/12"
                    />
                  )}
                  {active && reduced && (
                    <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-gold/12" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className={[
                      "shrink-0 transition-[color,transform] duration-300",
                      "group-hover:scale-110",
                      active ? "text-gold" : "text-taupe-text group-hover:text-gold",
                    ].join(" ")}
                  />

                  <span className="text-[14px] whitespace-nowrap">{c.label}</span>

                  {/* Son — chipning o'ng chekkasida, doim bir xil joyda. */}
                  <span
                    className={[
                      "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5",
                      "text-[11px] font-medium tabular-nums transition-colors duration-300",
                      active
                        ? "bg-gold-deep text-warm-white"
                        : "bg-cream text-espresso-soft/85 group-hover:bg-gold/15",
                    ].join(" ")}
                  >
                    {c.count}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </Reveal>

      {/* --- boshqaruv qatori --- */}
      <Reveal delay={0.06}>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-taupe/30 py-4">
          <button
            type="button"
            onClick={() => setOpenFilters((v) => !v)}
            aria-expanded={openFilters}
            className="inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-warm-white px-4 py-2 text-[14px] text-espresso transition-colors duration-300 hover:border-gold/50"
          >
            <SlidersHorizontal size={14} strokeWidth={1.6} aria-hidden="true" className="text-gold" />
            {t("filters")}
          </button>

          {dirty && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-[14px] text-espresso-soft/85 transition-colors duration-300 hover:text-gold-ink"
            >
              <X size={13} strokeWidth={1.6} aria-hidden="true" />
              {t("reset")}
            </button>
          )}

          <p aria-live="polite" className="text-[14px] text-espresso-soft/85">
            {t("found", { count: shown.length })}
          </p>

          <label className="ms-auto flex items-center gap-2 text-[14px] text-espresso-soft/85">
            {tp("sortLabel")}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-taupe/40 bg-warm-white px-3 py-2 text-[14px] text-espresso"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {tp(`sort.${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Reveal>

      {/* --- narx oralig'i --- */}
      <AnimatePresence initial={false}>
        {openFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.reveal, ease: EASE_LUX }}
            className="overflow-hidden"
          >
            <fieldset className="mt-5 rounded-2xl border border-taupe/30 bg-warm-white p-5">
              <legend className="px-1 text-[12px] tracking-[0.14em] text-espresso-soft/85 uppercase">
                {t("price")}
              </legend>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <NumberField
                  label={t("from")}
                  value={range[0]}
                  min={bounds.min}
                  max={range[1]}
                  onChange={(v) => setRange([Math.min(v, range[1]), range[1]])}
                />
                <NumberField
                  label={t("to")}
                  value={range[1]}
                  min={range[0]}
                  max={bounds.max}
                  onChange={(v) => setRange([range[0], Math.max(v, range[0])])}
                />
                <p className="text-[13px] text-espresso-soft/85">
                  {formatPrice(bounds.min, locale)} — {formatPrice(bounds.max, locale)}
                </p>
              </div>
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- to'r --- */}
      {shown.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-xl text-espresso">{t("empty")}</p>
          <p className="mt-2 text-sm text-espresso-soft">{t("emptyHint")}</p>
        </div>
      ) : (
        <motion.ul
          layout
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.li
                key={p._id}
                layout
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: DUR.reveal, ease: EASE_LUX }}
              >
                <ProductCard
                  product={p}
                  index={i}
                  badges={badges.filter((b) => p.badgeIds?.includes(b._id))}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </>
  );
}

/** Narx maydoni — faqat son, uch tilda ham bir xil ko'rinadi. */
function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[14px] text-espresso-soft">
      {label}
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={100_000}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-36 rounded-xl border border-taupe/40 bg-cream px-3 py-2 text-[14px] text-espresso"
      />
    </label>
  );
}
