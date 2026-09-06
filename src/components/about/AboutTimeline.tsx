"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { TimelinePoint } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { EASE_LUX } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";

/**
 * Kompaniya tarixi — MIXLANGAN gorizontal chiziq.
 *
 * Qanday ishlaydi: bo'lim ekranga to'lganda sahifa TO'XTAYDI (pin) va
 * keyingi aylantirish sahifani pastga emas, chiziqni o'ngga suradi.
 * Oxirgi yilga yetgach pin qo'yib yuboriladi va sahifa odatdagidek
 * davom etadi. Ya'ni "yil tugamaguncha pastga tushmaydi".
 *
 * Nega GSAP: bunday pin+scrub'ni qo'lda yozish `scroll` hodisasiga
 * obuna bo'lish, balandlikni hisoblash va Lenis bilan kadr ritmini
 * moslashni talab qiladi. Loyihada ScrollTrigger allaqachon Lenis
 * bilan ulangan (`LenisProvider`), shuning uchun u tekin keladi.
 *
 * Faol yil `onUpdate` da HISOBLANADI, lekin holat faqat u
 * O'ZGARGANDA yangilanadi — aks holda har kadrda React qayta
 * chizilardi va scroll sekinlashardi.
 *
 * Tor ekranda va harakat kamaytirilganda pin UMUMAN yo'q: nuqtalar
 * oddiy vertikal ro'yxat bo'lib chiziladi. Telefonda gorizontal pin
 * "yopishqoq" his beradi va foydalanuvchi sahifadan chiqib keta
 * olmay qoladi.
 */
export function AboutTimeline({
  points,
  locale,
  title,
}: {
  points: TimelinePoint[];
  locale: Locale;
  title: string;
}) {
  const { reduced } = useMediaTier();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const sorted = [...points].sort((a, b) => a.year - b.year);
  const last = sorted.length - 1;

  useGSAP(
    () => {
      if (reduced || sorted.length < 2 || !root.current) return;
      // Pin faqat keng ekranda — mantiq izohda.
      if (window.matchMedia("(max-width: 1023px)").matches) return;

      const fill = root.current.querySelector<HTMLElement>("[data-fill]");

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        // Har yilga bitta ekran balandligi — o'qishga yetarli vaqt.
        end: () => `+=${window.innerHeight * sorted.length}`,
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const i = Math.min(last, Math.floor(self.progress * sorted.length));
          setActive((prev) => (prev === i ? prev : i));

          /*
             Chiziqning to'lgan qismi to'g'ridan-to'g'ri DOM'ga
             yoziladi, React holati orqali emas: u har kadrda
             o'zgaradi va holat bo'lsa sahifa har kadrda qayta
             chizilardi.
          */
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
      });

      return () => st.kill();
    },
    { scope: root, dependencies: [reduced, sorted.length] },
  );

  if (sorted.length === 0) return null;

  const current = sorted[Math.min(active, last)];
  const hasImage = current.image.uploaded === true;

  return (
    <section ref={root} className="relative isolate overflow-hidden py-20 lg:py-24">
      <div className="container-lux">
        <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] text-espresso">{title}</h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-center lg:gap-14">
          {/* ---------- chap: matn ---------- */}
          <div className="min-h-[13rem]">
            {/*
              Matn "tutun"dan chiqadi va tutunga qaytadi: `blur` +
              `opacity`. `mode="wait"` ATAYLAB — eski matn butunlay
              so'nib bo'lgandan keyin yangisi keladi, aks holda ikki
              matn bir lahza ustma-ust o'qilardi.
            */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current._id}
                initial={reduced ? false : { opacity: 0, filter: "blur(14px)", y: 14 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(14px)", y: -10 }}
                transition={{ duration: 0.6, ease: EASE_LUX }}
              >
                <p className="text-[13px] tracking-[0.16em] text-gold-deep uppercase">
                  {current.year}
                </p>
                <h3 className="font-display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] text-espresso">
                  {pick(current.title, locale)}
                </h3>
                <p className="measure mt-4 text-[15px] leading-relaxed text-espresso-soft">
                  {pick(current.text, locale)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---------- o'ng: rasm ---------- */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_30px_60px_-28px_rgba(41,34,30,0.35)]">
            <AnimatePresence initial={false}>
              {hasImage ? (
                <motion.div
                  key={current.image.src}
                  initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE_LUX }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.image.src}
                    alt={pick(current.image.alt, locale)}
                    fill
                    quality={IMAGE_QUALITY}
                    sizes="(max-width: 1024px) 100vw, 26rem"
                    style={mediaFit(current.image).style}
                    className={mediaFit(current.image).className}
                  />
                </motion.div>
              ) : (
                /* Rasm yuklanmagan yil — bo'sh ramka o'rniga yil raqami. */
                <motion.span
                  key={`no-image-${current._id}`}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-display absolute inset-0 grid place-items-center text-[clamp(3rem,7vw,5rem)] text-taupe/50"
                >
                  {current.year}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- chiziq ---------- */}
        <div data-track className="relative mt-12">
          {/* Yo'lakcha va uning to'lgan qismi. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-taupe/35"
          />
          <span
            data-fill
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 scale-x-0 bg-gold-deep"
            style={{ transform: `scaleX(${sorted.length > 1 ? active / last : 1})` }}
          />

          <ul className="relative flex items-center justify-between">
            {sorted.map((p, i) => {
              const on = i === active;
              const passed = i <= active;
              return (
                <li key={p._id} className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={on ? "true" : undefined}
                    aria-label={String(p.year)}
                    className="grid place-items-center p-2"
                  >
                    {/*
                      Nuqtaga yetganda u bir marta kattalashib, o'z
                      o'lchamiga qaytadi — `key` da `active` bo'lgani
                      uchun animatsiya har kelishda qayta o'ynaydi.
                    */}
                    <motion.span
                      key={`${p._id}-${on}`}
                      initial={reduced || !on ? false : { scale: 1 }}
                      animate={on && !reduced ? { scale: [1, 1.9, 1.35] } : { scale: 1 }}
                      transition={{ duration: 0.5, times: [0, 0.45, 1], ease: EASE_LUX }}
                      className={[
                        "block size-2.5 rounded-full transition-colors duration-300",
                        passed ? "bg-gold-deep" : "bg-taupe/50",
                      ].join(" ")}
                    />
                  </button>

                  <motion.span
                    animate={
                      on && !reduced
                        ? { scale: [1, 1.18, 1], color: "var(--color-gold-deep)" }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.5, ease: EASE_LUX }}
                    className={[
                      "font-display text-[15px] tabular-nums",
                      on ? "text-gold-deep" : "text-espresso-soft/70",
                    ].join(" ")}
                  >
                    {p.year}
                  </motion.span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
