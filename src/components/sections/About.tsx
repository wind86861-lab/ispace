"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Expand, Play } from "lucide-react";
import type { About as AboutContent } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { useUi } from "@/store/useUi";
import { useMediaTier } from "@/hooks/useMediaTier";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollText } from "@/components/ui/ScrollText";
import { Counter } from "@/components/ui/Counter";
import { Magnetic } from "@/components/ui/Magnetic";
import { Modal } from "@/components/overlays/Modal";

export function About({ about }: { about: AboutContent }) {
  const t = useTranslations("about");
  const locale = useLocale() as Locale;
  const setVideoOpen = useUi((s) => s.setVideoOpen);
  const { reduced } = useMediaTier();

  /*
   * O'ng ustun — bitta SAHNA va uning ostidagi kichik kadrlar.
   *
   * Ilgari sahnada faqat video turardi, galereya esa alohida qator
   * bo'lib, bosilmasdi ham: to'rtta rasm shunchaki bezak edi. Endi
   * kichik kadr bosilsa sahnaga chiqadi, sahna bosilsa ochiladi —
   * video lightbox'da, foto esa kattalashtirilgan holda.
   *
   * `0` — video, `1..n` — galereya. Bitta son bilan yuritilgani
   * sabab: sahna doim BITTA element ko'rsatadi, ya'ni ikkita alohida
   * holat bir-biriga zid tushib qolmaydi.
   */
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const photo = active > 0 ? about.gallery[active - 1] : null;
  const stage = photo ?? about.video.poster;
  const stageAlt = pick(stage.alt, locale);

  return (
    <section id="about" className="relative isolate scroll-mt-28 py-24 sm:py-28 lg:py-32">
      {/* Fon: ikkita yumshoq yorug'lik dog'i, sekin siljib turadi. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="about-aura absolute inset-[-10%]" />
      </div>

      {/*
        Ustunlar orasi kengaydi (14 → 20) va matn ustuni birmuncha
        torroq: bo'lim "kichkina" ko'rinishining sababi shrift emas,
        MIQYOS edi — sarlavha ham, foto ham qolgan bo'limlarga
        nisbatan mayda turardi.
      */}
      {/*
        Ustunlar TENG EMAS: media o'ng tomonda kengroq (1.15) — u
        bo'limning og'irlik markazi, matn esa o'qish uchun baribir
        `measure` bilan cheklangan, ya'ni qolgan joydan foydalana
        olmasdi.
      */}
      <div className="container-lux grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-20">
        {/* ---- chap: matn va statistika ---- */}
        <div>
          <Reveal as="p" y={14}>
            <span className="inline-block rounded-full border border-taupe/45 px-4 py-2 text-[12px] tracking-[0.18em] text-espresso-soft/85 uppercase">
              {pick(about.eyebrow, locale)}
            </span>
          </Reveal>

          <SplitHeading
            label={pick(about.title, locale)}
            className="mt-5 text-[clamp(2.1rem,4.2vw,3.5rem)] leading-[1.1]"
          >
            {pick(about.title, locale)}
          </SplitHeading>

          {/*
            Paragraflar scroll bilan **so'zma-so'z yoziladi** — bu bo'limning
            o'z ritmi: matn uzun va u sekin o'qiladi, shuning uchun
            animatsiya vaqt bilan emas, aylantirish tezligi bilan
            boshqarilgani tabiiy chiqadi.
          */}
          <div className="mt-7 space-y-5">
            {about.paragraphs.map((p, i) => (
              <ScrollText
                key={i}
                label={pick(p, locale)}
                className="measure text-[16px] leading-relaxed text-espresso-soft sm:text-base"
              >
                {pick(p, locale)}
              </ScrollText>
            ))}
          </div>

          <Reveal stagger className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-taupe/25 sm:grid-cols-4">
            {about.stats.map((stat) => (
              <div key={stat._id} className="bg-cream px-5 py-6">
                <p className="font-display text-[clamp(1.75rem,3vw,2.5rem)] text-gold">
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                    /* Yil guruhlanmaydi: 2007, "2 007" emas. */
                    grouped={stat.value > 9999}
                  />
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-espresso-soft">
                  {pick(stat.label, locale)}
                </p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* ---- o'ng: sahna va kichik kadrlar ---- */}
        <div className="flex flex-col gap-4">
          <Reveal className="relative">
            {/* Sahna ortidagi iliq nur — karta "ko'tarilgandek" ko'rinadi. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 -bottom-3 -z-10 h-16 rounded-full bg-gold/25 blur-2xl"
            />

            <button
              type="button"
              onClick={() => (photo ? setZoom(true) : setVideoOpen(true))}
              aria-label={photo ? stageAlt : t("playVideo")}
              className="group relative block aspect-video w-full overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_30px_60px_-28px_rgba(41,34,30,0.35)] transition-shadow duration-700 hover:shadow-[0_38px_72px_-28px_rgba(41,34,30,0.45)]"
            >
              {/*
                Kadr almashganda YUMSHOQ o'tish: yangisi biroz
                kattaroqdan kelib joyiga o'tiradi, eskisi so'nadi.
                `mode="wait"` ATAYLAB emas — ikkalasi bir vaqtda
                ko'rinsin, aks holda oraliqda bo'sh krem maydon
                miltillab qolardi.
              */}
              <AnimatePresence initial={false}>
                <motion.span
                  key={stage.src}
                  initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={stage.src}
                    alt={stageAlt}
                    fill
                    quality={IMAGE_QUALITY}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    style={mediaFit(stage).style}
                    className={`${mediaFit(stage).className} transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-105`}
                  />
                </motion.span>
              </AnimatePresence>

              {/* Fotoda parda yengil: u syujet. Videoda esa quyuqroq —
                  oltin tugma ustida turadi va kontrast kerak. */}
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-0 transition-colors duration-500",
                  photo
                    ? "bg-espresso/0 group-hover:bg-espresso/10"
                    : "bg-espresso/25 group-hover:bg-espresso/15",
                ].join(" ")}
              />

              {photo ? (
                <span
                  aria-hidden="true"
                  className="absolute right-4 bottom-4 grid size-10 place-items-center rounded-full bg-warm-white/90 text-espresso opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <Expand size={16} strokeWidth={1.6} />
                </span>
              ) : (
                <Magnetic strength={0.3}>
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-warm-white shadow-lg transition-colors duration-300 group-hover:bg-gold-light lg:size-20"
                  >
                    <Play size={22} strokeWidth={1.6} fill="currentColor" />
                  </span>
                </Magnetic>
              )}
            </button>
          </Reveal>

          {/*
            Birinchi kadr — VIDEO. U qatorda turishi shart: foto sahnaga
            chiqqach, videoga qaytadigan yo'l kerak, aks holda
            foydalanuvchi sahifani yangilashga majbur bo'lardi.
          */}
          <ul aria-label={t("galleryAria")} className="grid grid-cols-5 gap-2.5 sm:gap-4">
            {[about.video.poster, ...about.gallery].map((media, i) => {
              const on = i === active;
              return (
                <li key={`${media.src}-${i}`}>
                  <Reveal variant="mask" delay={i * 0.06}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={on ? "true" : undefined}
                      aria-label={i === 0 ? t("playVideo") : pick(media.alt, locale)}
                      className={[
                        "group relative block aspect-square w-full overflow-hidden rounded-xl bg-cream",
                        "outline-offset-2 transition-shadow duration-500",
                        on
                          ? "shadow-[0_0_0_2px_var(--color-gold)]"
                          : "shadow-[0_0_0_1px_rgba(41,34,30,0.1)] hover:shadow-[0_0_0_1px_var(--color-gold)]",
                      ].join(" ")}
                    >
                      <Image
                        src={media.src}
                        alt=""
                        fill
                        quality={IMAGE_QUALITY}
                        sizes="(max-width: 1024px) 20vw, 10vw"
                        style={mediaFit(media).style}
                        className={[
                          mediaFit(media).className,
                          "transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-110",
                          // Faol bo'lmagan kadr biroz orqaga chekinadi.
                          on ? "" : "opacity-80 group-hover:opacity-100",
                        ].join(" ")}
                      />

                      {i === 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 grid place-items-center bg-espresso/30"
                        >
                          <span className="grid size-7 place-items-center rounded-full bg-gold text-warm-white">
                            <Play size={11} strokeWidth={1.8} fill="currentColor" />
                          </span>
                        </span>
                      )}
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/*
        Foto uchun lightbox shu yerda, `useUi` da EMAS: uni ochadigan ham,
        yopadigan ham faqat shu bo'lim. Video lightbox esa global —
        uni sahifaning boshqa joylaridan ham ochish mumkin.
      */}
      <Modal wide open={zoom} onClose={() => setZoom(false)} title={stageAlt}>
        <div className="flex justify-center">
          <Image
            src={stage.src}
            alt={stageAlt}
            width={stage.width ?? 1200}
            height={stage.height ?? 1200}
            quality={IMAGE_QUALITY}
            sizes="(max-width: 1024px) 100vw, 56rem"
            className="h-auto max-h-[78vh] w-auto rounded-xl object-contain shadow-2xl"
          />
        </div>
      </Modal>
    </section>
  );
}
