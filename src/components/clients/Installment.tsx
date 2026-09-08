"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { motionEnabled } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { useUi } from "@/store/useUi";

/** Shartlar — matnda ham, hisobda ham BITTA manbadan. */
const DOWN = 0.3;
const MONTHS = 3;

/**
 * Muddatli to'lov kalkulyatori.
 *
 * Nega bu kerak: «30% va 3 oy» — shart, «567 000 so'm oyiga» — QAROR.
 * Foydalanuvchi o'z modelini tanlab, o'z raqamini ko'radi; shundan
 * keyingina bo'lib to'lash unga tegishli bo'lib qoladi.
 *
 * Raqamlar DOM'ga to'g'ridan-to'g'ri yoziladi (`textContent`): har
 * kadrda holat yangilansa React butun bo'limni qayta chizardi, bu esa
 * silliqlikni yo'qotardi.
 */
export function Installment({ products }: { products: Product[] }) {
  const t = useTranslations("clientsPage");
  const locale = useLocale() as Locale;
  const openOverlay = useUi((s) => s.open);

  /* Eng arzonidan boshlab — foydalanuvchi ustiga qarab ko'tariladi. */
  const list = [...products].sort((a, b) => a.price - b.price).slice(0, 6);
  const [price, setPrice] = useState(list[0]?.price ?? 5_000_000);
  const [picked, setPicked] = useState<string | null>(list[0]?._id ?? null);

  /*
   * Chegaralar ro'yxatdan KENGROQ olinadi.
   *
   * Sabab: bitta mahsulot bo'lsa `min === max` bo'lib, surgich qotib
   * qolardi — foydalanuvchi uni sura olmasdi. Bundan tashqari
   * katalogdagi eng qimmatidan qimmatroq buyurtma (bir nechta buyum)
   * ham bo'lishi mumkin.
   */
  const prices = list.map((p) => p.price);
  const min = Math.max(500_000, Math.round((Math.min(...prices, 5_000_000) * 0.5) / 100_000) * 100_000);
  const max = Math.round((Math.max(...prices, 5_000_000) * 1.6) / 100_000) * 100_000;

  const down = Math.round(price * DOWN);
  const monthly = Math.round((price - down) / MONTHS);

  return (
    <section className="relative isolate scroll-mt-28 border-y border-taupe/25 bg-greige/45 py-20 sm:py-24">
      <div className="container-lux">
        <SectionHeading title={t("calc.title")} subtitle={t("calc.subtitle")} />

        <div className="mx-auto mt-12 max-w-3xl">
          {/* ---- model tanlash ---- */}
          {list.length > 0 && (
            <Reveal>
              <ul className="flex flex-wrap justify-center gap-2">
                {list.map((p) => {
                  const on = p._id === picked;
                  return (
                    <li key={p._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPicked(p._id);
                          setPrice(p.price);
                        }}
                        className={[
                          "rounded-full border px-4 py-2 text-[13px] transition-colors duration-300",
                          on
                            ? "border-gold/60 bg-gold/12 text-gold-ink"
                            : "border-taupe/40 bg-warm-white text-espresso-soft hover:border-gold/50 hover:text-espresso",
                        ].join(" ")}
                      >
                        {pick(p.title, locale)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}

          {/* ---- narx surgichi ---- */}
          <Reveal delay={0.06} className="mt-9">
            <label className="block">
              <span className="mb-3 flex items-baseline justify-between">
                <span className="text-[13px] text-espresso-soft">{t("calc.amount")}</span>
                <Money value={price} locale={locale} className="font-display text-[20px] text-espresso" />
              </span>
              {/*
                Surgich narxni QO'LDA tanlashga imkon beradi: ro'yxatda
                yo'q model yoki bir nechta buyum uchun. Qadam 100 000 —
                undan mayda qadam raqamlarni shovqinli qilardi.
              */}
              <input
                type="range"
                min={min}
                max={max}
                step={100_000}
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value));
                  setPicked(null);
                }}
                aria-label={t("calc.amount")}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-taupe/35 accent-[var(--color-gold-deep)]"
              />
            </label>
          </Reveal>

          {/* ---- natija ---- */}
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-gold/35 bg-warm-white p-6">
                <p className="text-[12px] tracking-[0.14em] text-espresso-soft/85 uppercase">
                  {t("calc.down")}
                </p>
                <Money
                  value={down}
                  locale={locale}
                  className="font-display mt-2 block text-[clamp(1.5rem,3vw,2rem)] leading-none text-gold-deep"
                />
                <p className="mt-2 text-[13px] text-espresso-soft">{t("calc.downNote")}</p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="rounded-2xl border border-taupe/30 bg-warm-white p-6">
                <p className="text-[12px] tracking-[0.14em] text-espresso-soft/85 uppercase">
                  {t("calc.monthly")}
                </p>
                <Money
                  value={monthly}
                  locale={locale}
                  className="font-display mt-2 block text-[clamp(1.5rem,3vw,2rem)] leading-none text-espresso"
                />
                <p className="mt-2 text-[13px] text-espresso-soft">{t("calc.monthlyNote")}</p>
              </div>
            </Reveal>
          </div>

          {/* ---- to'lov jadvali ---- */}
          <Reveal delay={0.16} className="mt-6">
            <PlanBar down={down} monthly={monthly} price={price} locale={locale} />
          </Reveal>

          <Reveal delay={0.2} className="mt-8 text-center">
            <p className="text-[13px] text-espresso-soft">{t("calc.note")}</p>
            <div className="mt-5 inline-block">
              <Magnetic strength={0.3}>
                <Button variant="gold" size="lg" withArrow onClick={() => openOverlay("consult")}>
                  {t("calc.cta")}
                </Button>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * To'lov jadvali — to'rt ustun: bugun va uch oy.
 *
 * Ustunlar balandligi summaga MUTANOSIB: birinchisi ko'zga tashlanib
 * turadi va «30% bugun» degan shart raqamsiz ham ko'rinadi.
 */
function PlanBar({
  down,
  monthly,
  price,
  locale,
}: {
  down: number;
  monthly: number;
  price: number;
  locale: Locale;
}) {
  const t = useTranslations("clientsPage");
  const reduced = useReducedMotion();

  const steps = [
    { key: "now", value: down },
    { key: "m1", value: monthly },
    { key: "m2", value: monthly },
    { key: "m3", value: monthly },
  ];
  const top = Math.max(...steps.map((s) => s.value)) || 1;

  return (
    <div className="rounded-2xl border border-taupe/30 bg-warm-white p-6">
      <ul className="flex items-end gap-3 sm:gap-4">
        {steps.map((s, i) => (
          <li key={s.key} className="flex flex-1 flex-col items-center gap-3">
            <span className="text-[12px] tabular-nums text-espresso-soft">
              {formatPrice(s.value, locale)}
            </span>
            <span
              /*
                Balandlik CSS o'tishida o'zgaradi va har ustun o'z
                kechikishiga ega: qiymat almashganda jadval chapdan
                o'ngga "to'lib" boradi.
              */
              style={{
                height: `${Math.max(14, (s.value / top) * 100)}%`,
                transitionDelay: reduced ? "0ms" : `${i * 70}ms`,
                transitionDuration: reduced ? "0ms" : "700ms",
              }}
              className={[
                "w-full rounded-t-lg transition-[height] ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                i === 0 ? "bg-gradient-to-t from-gold-deep to-gold" : "bg-taupe/45",
              ].join(" ")}
              aria-hidden="true"
            />
            <span className="text-[12px] text-espresso-soft/85">{t(`calc.steps.${s.key}`)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-taupe/25 pt-4 text-center text-[13px] text-espresso-soft">
        {t("calc.total")} <span className="text-espresso">{formatPrice(price, locale)}</span>
      </p>
    </div>
  );
}

/**
 * Pul miqdori — qiymat o'zgarganda raqam SANAB o'tadi.
 *
 * Nega: sakrab almashgan raqam "boshqa son" bo'lib ko'rinadi, sanab
 * o'tgani esa O'SHA sonning o'zgarishi. Foydalanuvchi surgichni
 * surganda aynan shu bog'liqlikni his qilishi kerak.
 */
function Money({
  value,
  locale,
  className = "",
}: {
  value: number;
  locale: Locale;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reduced || !motionEnabled()) {
        el.textContent = formatPrice(value, locale);
        shown.current = value;
        return;
      }

      const state = { v: shown.current };
      const tween = gsap.to(state, {
        v: value,
        duration: 0.6,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = formatPrice(Math.round(state.v), locale);
        },
        onComplete: () => {
          shown.current = value;
        },
      });
      return () => tween.kill();
    },
    { dependencies: [value, locale, reduced] },
  );

  /* SSR va birinchi render — yakuniy qiymat, ya'ni JS'siz ham to'g'ri. */
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {formatPrice(value, locale)}
    </span>
  );
}
