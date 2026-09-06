"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { About, TimelinePoint } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { EASE_LUX } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Counter } from "@/components/ui/Counter";

/**
 * Sahifa boshi — va ayni paytda kompaniya tarixi.
 *
 * MIXLASH. Blok ekranga to'lganda sahifa butunlay to'xtaydi: keyingi
 * aylantirish uni pastga emas, yillar bo'ylab oldinga suradi.
 *
 * Blokning o'lchamiga TEGILMAYDI: u o'z tabiiy balandligida qoladi.
 * Uni ekran balandligiga cho'zib, kontentni markazga qo'yish tepada
 * katta bo'sh joy qoldirardi.
 *
 * MATN. Har yilning matni bir zumda paydo bo'lmaydi: aylantirilgan
 * sari HARFMA-HARF ochiladi. Har harf tutundan chiqadi (`blur` +
 * `opacity`), ya'ni matn scroll tezligida yozilayotgandek ko'rinadi.
 * Yil to'liq o'qib bo'lingach nuqta pulsatsiya qiladi.
 *
 * Harflar React HOLATI orqali yuritilmaydi. Aks holda har kadrda
 * yuzlab tugunli daraxt qayta chizilardi. O'rniga ular bir marta
 * chiziladi va scroll paytida FAQAT O'ZGARGANLARI to'g'ridan-to'g'ri
 * DOM'da yangilanadi — bir kadrda odatda bir-ikkita harf.
 *
 * TOR EKRAN va harakat kamaytirilgan rejim: pin umuman yo'q, blok
 * oddiy holicha turadi va yillar nuqtalarni bosib ko'riladi.
 */
export function AboutIntro({
  about,
  timeline,
  locale,
  title,
}: {
  about: About;
  timeline: TimelinePoint[];
  locale: Locale;
  title: string;
}) {
  const { reduced } = useMediaTier();
  const root = useRef<HTMLDivElement>(null);

  /** `-1` — umumiy tavsif; `0..n-1` — tarix nuqtalari. */
  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(false);

  /** Matndagi harf tugunlari va oxirgi ochilgan harf soni. */
  const chars = useRef<HTMLElement[]>([]);
  const shownRef = useRef(0);
  const textRef = useRef<HTMLParagraphElement>(null);
  /** Yil to'liq o'qib bo'lindimi — nuqta shunda pulsatsiya qiladi. */
  const [done, setDone] = useState(false);

  const points = [...timeline].sort((a, b) => a.year - b.year);
  /** Nol nuqta + yillar. */
  const steps = points.length + 1;

  const current = active >= 0 ? points[Math.min(active, points.length - 1)] : null;
  const stats = current?.stats.length ? current.stats : about.stats;

  const text = current ? pick(current.text, locale) : "";
  const words = text.split(" ");

  /**
   * Harflarni ko'rsatish/yashirish — to'g'ridan-to'g'ri DOM'da.
   *
   * Faqat `from` dan `to` gacha bo'lgan oraliq yangilanadi, ya'ni bir
   * kadrda bir-ikkita tugun. Butun ro'yxatni har safar aylanib chiqish
   * uzun matnda sezilarli ish bo'lardi.
   */
  const paint = (to: number) => {
    const list = chars.current;
    const from = shownRef.current;
    if (to === from) return;

    for (let i = Math.min(from, to); i < Math.max(from, to); i++) {
      const el = list[i];
      if (!el) continue;
      const on = i < to;
      el.style.opacity = on ? "1" : "0";
      el.style.filter = on ? "blur(0px)" : "blur(10px)";
    }
    shownRef.current = to;
  };

  /* Yangi yilga o'tilganda harflar qaytadan yashiriladi. */
  useEffect(() => {
    if (!textRef.current) return;
    chars.current = Array.from(textRef.current.querySelectorAll<HTMLElement>("[data-ch]"));
    shownRef.current = chars.current.length;
    paint(pinned ? 0 : chars.current.length);
    setDone(!pinned);
  }, [current?._id, pinned]);

  useGSAP(
    () => {
      if (reduced || points.length === 0 || !root.current) return;
      if (window.matchMedia("(max-width: 1023px)").matches) return;

      const fill = root.current.querySelector<HTMLElement>("[data-fill]");
      setPinned(true);

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        // Har qadamga bitta ekran balandligi — o'qishga yetarli vaqt.
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const raw = self.progress * steps;
          const step = Math.min(steps - 1, Math.floor(raw));
          const local = raw - step; // 0..1 — qadam ichidagi holat

          setActive((prev) => (prev === step - 1 ? prev : step - 1));

          /*
             Matn qadamning DASTLABKI 70% ida to'liq ochiladi: qolgan
             30% o'qish uchun tinch pauza bo'lib qoladi.
          */
          const ratio = Math.min(1, local / 0.7);
          const total = chars.current.length;
          const next = Math.round(ratio * total);
          paint(next);
          setDone((prev) => {
            const value = total > 0 && next >= total;
            return prev === value ? prev : value;
          });

          /*
             Chiziqning to'lgan qismi to'g'ridan-to'g'ri DOM'ga
             yoziladi: u har kadrda o'zgaradi va holat orqali
             yuritilsa sahifa har kadrda qayta chizilardi.
          */
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
      });

      return () => {
        st.kill();
        setPinned(false);
      };
    },
    { scope: root, dependencies: [reduced, steps] },
  );

  const yearImage = current?.image.uploaded === true ? current.image : null;
  const fallback = about.gallery.find((m) => m.uploaded === true);
  const media = yearImage ?? fallback ?? null;

  return (
    /*
      Blok o'z tabiiy balandligida qoladi — `h-screen` yoki vertikal
      markazlashtirish YO'Q. Ular pin paytida tepada katta bo'sh joy
      qoldirardi va joylashuvni o'zgartirardi.
    */
    <div ref={root}>
      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-center lg:gap-14">
        <div>
          <p className="inline-block rounded-full border border-taupe/45 px-3.5 py-1.5 text-[11px] tracking-[0.16em] text-espresso-soft/85 uppercase">
            {pick(about.eyebrow, locale)}
          </p>

          <SplitHeading
            as="h1"
            label={title}
            className="mt-4 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1]"
          >
            {title}
          </SplitHeading>

          {/*
            `min-h` — matn uzunligi yildan yilga farq qiladi; usiz blok
            har almashinuvda balandligini o'zgartirib, ostidagi raqamlar
            va chiziqni sakratardi.
          */}
          <div className="mt-6 min-h-[9.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?._id ?? "intro"}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE_LUX }}
              >
                {current ? (
                  <>
                    <p className="font-display text-[15px] tracking-[0.16em] text-gold-deep">
                      {current.year}
                    </p>
                    <h2 className="font-display mt-2 text-[clamp(1.3rem,2.4vw,1.85rem)] leading-[1.15] text-espresso">
                      {pick(current.title, locale)}
                    </h2>

                    {/* Harfma-harf ochilish — izohi komponent boshida. */}
                    <p
                      ref={textRef}
                      className="measure mt-3 text-[16px] leading-relaxed text-espresso-soft"
                    >
                      {/*
                        So'z butun bo'lib o'raladi (`inline-block`):
                        harflar alohida tugun bo'lgani uchun usiz satr
                        so'z o'rtasidan uzilib ketardi.
                      */}
                      {words.map((w, wi) => (
                        <span key={`${current._id}-w${wi}`} className="inline-block">
                          {[...w].map((ch, ci) => (
                            <span
                              key={ci}
                              data-ch
                              className="transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]"
                            >
                              {ch}
                            </span>
                          ))}
                          {wi < words.length - 1 ? "\u00A0" : ""}
                        </span>
                      ))}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    {about.paragraphs.map((p, i) => (
                      <p key={i} className="measure text-[16px] leading-relaxed text-espresso-soft">
                        {pick(p, locale)}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---------- raqamlar: har yilga o'ziniki ---------- */}
          <div className="mt-8 grid min-h-[4.5rem] grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?._id ?? "intro-stats"}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: EASE_LUX }}
                className="contents"
              >
                {stats.map((stat) => (
                  <div key={stat._id} className="border-s border-taupe/40 ps-4">
                    <Counter
                      value={stat.value}
                      suffix={stat.suffix}
                      /* `2007` yil bo'lib qolsin, "2 007" emas. */
                      grouped={stat.value > 9999}
                      className="font-display text-[clamp(1.35rem,2.6vw,1.85rem)] leading-none text-gold-deep"
                    />
                    <p className="mt-1.5 text-[13px] leading-snug text-espresso-soft">
                      {pick(stat.label, locale)}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- o'ngdagi rasm: yil bilan almashadi ---------- */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_30px_60px_-28px_rgba(41,34,30,0.35)]">
          <AnimatePresence initial={false}>
            {media ? (
              <motion.div
                key={media.src}
                initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_LUX }}
                className="absolute inset-0"
              >
                <Image
                  src={media.src}
                  alt={pick(media.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  priority
                  sizes="(max-width: 1024px) 100vw, 30rem"
                  style={mediaFit(media).style}
                  className={mediaFit(media).className}
                />
              </motion.div>
            ) : (
              /* Hech qanday rasm yo'q — bo'sh ramka o'rniga yil raqami. */
              <motion.span
                key={`no-media-${current?._id ?? "intro"}`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display absolute inset-0 grid place-items-center text-[clamp(3rem,7vw,5rem)] text-taupe/50"
              >
                {current?.year ?? ""}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---------- yillar chizig'i: BUTUN KENGLIKDA ---------- */}
      {points.length > 0 && (
        <div className="relative mt-12 lg:mt-14">
          <span aria-hidden="true" className="absolute inset-x-0 top-2 h-px bg-taupe/35" />
          <span
            data-fill
            aria-hidden="true"
            className="absolute inset-x-0 top-2 h-px origin-left bg-gold-deep"
            style={{ transform: `scaleX(${pinned ? 0 : 1})` }}
          />

          <ul className="relative flex items-start justify-between">
            {points.map((p, i) => {
              const on = i === active;
              return (
                <li key={p._id} className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={on ? "true" : undefined}
                    aria-label={String(p.year)}
                    className="grid place-items-center"
                  >
                    {/*
                      Nuqta yilga YETGANDA emas, matn O'QIB BO'LINGANDA
                      pulsatsiya qiladi (`done`) — shunda harakat
                      "yakunlandi" degan ma'no beradi.
                    */}
                    <motion.span
                      key={`${p._id}-${on && done}`}
                      animate={on && done && !reduced ? { scale: [1, 2, 1.35] } : { scale: 1 }}
                      transition={{ duration: 0.55, times: [0, 0.45, 1], ease: EASE_LUX }}
                      className={[
                        "block size-3 rounded-full transition-colors duration-300",
                        i <= active ? "bg-gold-deep" : "bg-taupe/50",
                      ].join(" ")}
                    />
                  </button>

                  <motion.span
                    animate={on && done && !reduced ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.55, ease: EASE_LUX }}
                    className={[
                      "font-display text-[14px] tabular-nums transition-colors duration-300",
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
      )}
    </div>
  );
}
