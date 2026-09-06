"use client";

import { useRef, useState } from "react";
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
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { AboutSlideshow } from "./AboutSlideshow";

/**
 * Sahifa boshi — va ayni paytda kompaniya tarixi.
 *
 * Blok ekranga to'lganda sahifa TO'XTAYDI (`pin`) va keyingi
 * aylantirish uni pastga emas, yillar bo'ylab oldinga suradi. Har
 * yilga yetganda chapdagi matn va o'ngdagi rasm o'sha yilnikiga
 * almashadi, pastdagi chiziq esa to'lib boradi. Oxirgi yildan keyin
 * pin qo'yib yuboriladi va sahifa odatdagidek davom etadi.
 *
 * Nega alohida "tarix bo'limi" emas: yillar uchun ikkinchi blok
 * ochilsa, sahifada bir xil tuzilma (matn + rasm) ikki marta
 * takrorlanardi va o'quvchi nima o'zgarganini tushunmasdi. Bu yerda
 * esa boshlang'ich holat tarixning "nol nuqtasi" bo'lib xizmat qiladi.
 *
 * `active === -1` — kompaniyaning umumiy tavsifi va galereya
 * slaydshousi; undan keyingina yillar boshlanadi.
 *
 * Tor ekranda va harakat kamaytirilganda pin YO'Q — u yerda blok
 * oddiy holicha qoladi va yillarni nuqtalarni bosib ko'rish mumkin.
 * Telefonda pin "yopishqoq" his beradi va foydalanuvchi sahifadan
 * chiqib keta olmay qoladi.
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

  const points = [...timeline].sort((a, b) => a.year - b.year);
  /** Nol nuqta + yillar. */
  const steps = points.length + 1;

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
        scrub: 0.6,
        onUpdate: (self) => {
          const i = Math.min(steps - 1, Math.floor(self.progress * steps)) - 1;
          setActive((prev) => (prev === i ? prev : i));

          /*
            Chiziqning to'lgan qismi to'g'ridan-to'g'ri DOM'ga yoziladi,
            React holati orqali emas: u har kadrda o'zgaradi va holat
            bo'lsa sahifa har kadrda qayta chizilardi.
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

  const current = active >= 0 ? points[Math.min(active, points.length - 1)] : null;
  const yearImage = current?.image.uploaded === true ? current.image : null;

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <Reveal>
          <p className="inline-block rounded-full border border-taupe/45 px-3.5 py-1.5 text-[11px] tracking-[0.16em] text-espresso-soft/85 uppercase">
            {pick(about.eyebrow, locale)}
          </p>
        </Reveal>

        <SplitHeading
          as="h1"
          label={title}
          className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1]"
        >
          {title}
        </SplitHeading>

        {/*
          Matn "tutun"dan chiqadi va tutunga qaytadi (`blur` + `opacity`,
          ikkala yo'nalishda ham). `mode="wait"` ATAYLAB: eski matn
          butunlay so'nib bo'lgandan keyin yangisi keladi, aks holda
          ikkalasi bir lahza ustma-ust o'qilardi.

          `min-h` — matn uzunligi yildan yilga farq qiladi; usiz blok
          har almashinuvda balandligini o'zgartirib, ostidagi chiziqni
          sakratardi.
        */}
        <div className="mt-6 min-h-[11rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?._id ?? "intro"}
              initial={reduced ? false : { opacity: 0, filter: "blur(14px)", y: 12 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(14px)", y: -8 }}
              transition={{ duration: 0.55, ease: EASE_LUX }}
            >
              {current ? (
                <>
                  <p className="font-display text-[15px] tracking-[0.16em] text-gold-deep">
                    {current.year}
                  </p>
                  <h2 className="font-display mt-2 text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.15] text-espresso">
                    {pick(current.title, locale)}
                  </h2>
                  <p className="measure mt-3 text-[16px] leading-relaxed text-espresso-soft">
                    {pick(current.text, locale)}
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

        {/* Raqamlar — sahifaning "dalil" qismi. */}
        <Reveal
          stagger={0.08}
          delay={0.2}
          className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4"
        >
          {about.stats.map((stat) => (
            <div key={stat._id} className="border-s border-taupe/40 ps-4">
              {/*
                Bosh sahifadagi bilan bir xil harakat: son ko'rish
                maydoniga kirganda sanaladi.

                `grouped` faqat o'n mingdan katta sonlarda: `2007` yil
                bo'lib qolishi kerak, "2 007" emas.
              */}
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                grouped={stat.value > 9999}
                className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-none text-gold-deep"
              />
              <p className="mt-1.5 text-[13px] leading-snug text-espresso-soft">
                {pick(stat.label, locale)}
              </p>
            </div>
          ))}
        </Reveal>

        {/* ---------- yillar chizig'i ---------- */}
        {points.length > 0 && (
          <div className="relative mt-12">
            <span aria-hidden="true" className="absolute inset-x-0 top-1.5 h-px bg-taupe/35" />
            <span
              data-fill
              aria-hidden="true"
              className="absolute inset-x-0 top-1.5 h-px origin-left bg-gold-deep"
              style={{ transform: `scaleX(${pinned ? 0 : 1})` }}
            />

            <ul className="relative flex items-start justify-between">
              {points.map((p, i) => {
                const on = i === active;
                return (
                  <li key={p._id} className="flex flex-col items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={on ? "true" : undefined}
                      aria-label={String(p.year)}
                      className="grid place-items-center"
                    >
                      {/*
                        Nuqtaga yetganda u bir marta kattalashib, o'z
                        o'lchamiga qaytadi — `key` da `on` bo'lgani uchun
                        animatsiya har kelishda qayta o'ynaydi.
                      */}
                      <motion.span
                        key={`${p._id}-${on}`}
                        animate={on && !reduced ? { scale: [1, 1.9, 1.3] } : { scale: 1 }}
                        transition={{ duration: 0.5, times: [0, 0.45, 1], ease: EASE_LUX }}
                        className={[
                          "block size-3 rounded-full transition-colors duration-300",
                          i <= active ? "bg-gold-deep" : "bg-taupe/50",
                        ].join(" ")}
                      />
                    </button>

                    <motion.span
                      animate={on && !reduced ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, ease: EASE_LUX }}
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

      {/* ---------- o'ngdagi media ---------- */}
      <Reveal variant="mask" className="lg:self-start">
        {yearImage ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_30px_60px_-28px_rgba(41,34,30,0.35)]">
            <AnimatePresence initial={false}>
              <motion.div
                key={yearImage.src}
                initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_LUX }}
                className="absolute inset-0"
              >
                <Image
                  src={yearImage.src}
                  alt={pick(yearImage.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  style={mediaFit(yearImage).style}
                  className={mediaFit(yearImage).className}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /*
            Yilga rasm yuklanmagan bo'lsa galereya slaydshousi qoladi —
            blok hech qachon bo'sh ramkaga aylanmaydi.
          */
          <AboutSlideshow
            slides={about.gallery.filter((m) => m.uploaded === true)}
            locale={locale}
          />
        )}
      </Reveal>
    </div>
  );
}
