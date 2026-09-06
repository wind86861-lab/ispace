"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Media } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { EASE_LUX } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";

/**
 * «Kompaniya haqida» sahifasidagi katta media — aylanib turadigan.
 *
 * Ilgari bu yerda BITTA statik kadr turardi (video muqovasi) va u
 * yuklanmagan bo'lsa sahifa yarmi bo'sh krem to'rtburchak bo'lib
 * qolardi. Endi mavjud fotolarning hammasi navbat bilan ko'rsatiladi:
 * bitta rasm yuklanmagan bo'lsa ham blok tirik qoladi.
 *
 * Uch qatlam:
 *  · kadr almashinuvi — crossfade (ikkalasi bir vaqtda ko'rinadi, aks
 *    holda oraliqda bo'sh krem miltillardi);
 *  · Ken Burns — kadr sekin yaqinlashadi, ya'ni foto "qotib" turmaydi;
 *  · progress — pastdagi chiziqchalar, faoli to'lib boradi.
 *
 * Harakat kamaytirilgan bo'lsa hammasi o'chadi va birinchi kadr
 * statik qoladi.
 */
const INTERVAL = 5000;

export function AboutSlideshow({ slides, locale }: { slides: Media[]; locale: Locale }) {
  const { reduced } = useMediaTier();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearInterval(id);
  }, [reduced, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index % slides.length];

  return (
    <div className="relative">
      {/* Karta ortidagi iliq nur — u "ko'tarilgandek" ko'rinadi. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 -bottom-4 -z-10 h-20 rounded-full bg-gold/25 blur-2xl"
      />

      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_30px_60px_-28px_rgba(41,34,30,0.35)]">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.src}
            initial={reduced ? false : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: reduced ? 1 : 1.04 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.1, ease: EASE_LUX },
              // Zoom butun ko'rsatish davomida davom etadi — Ken Burns.
              scale: { duration: INTERVAL / 1000 + 1.2, ease: "linear" },
            }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={pick(current.alt, locale)}
              fill
              quality={IMAGE_QUALITY}
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 46vw"
              style={mediaFit(current).style}
              className={mediaFit(current).className}
            />
          </motion.div>
        </AnimatePresence>

        {/*
          Pastki boshqaruv.

          Chiziqchalar ilgari `h-0.5` edi va rasmning eng chekkasida
          turardi: och fon ustida ular deyarli ko'rinmasdi va bosish
          uchun ham juda ingichka edi. Endi parda balandroq, chiziqcha
          qalinroq, bosish maydoni esa `py-3` bilan kengaytirilgan —
          ko'rinishi o'zgarmaydi, lekin barmoq bilan ham tegiladi.
        */}
        {slides.length > 1 && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-espresso/65 via-espresso/25 to-transparent"
            />

            <ul className="absolute inset-x-6 bottom-4 flex items-center gap-2.5">
              {slides.map((s, i) => (
                <li key={s.src} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={pick(s.alt, locale)}
                    aria-current={i === index ? "true" : undefined}
                    className="group block w-full py-3"
                  >
                    <span className="block h-1 overflow-hidden rounded-full bg-cream/35 transition-colors duration-300 group-hover:bg-cream/55">
                      {/*
                        Faol chiziqcha TO'LIB boradi — qolgan vaqtni
                        ko'rsatadi. `key` da `index` bor: har almashinuvda
                        animatsiya boshidan qayta o'ynaydi.
                      */}
                      <motion.span
                        key={`${i}-${index}`}
                        initial={{ scaleX: i === index && !reduced ? 0 : i < index ? 1 : 0 }}
                        animate={{ scaleX: i === index ? 1 : i < index ? 1 : 0 }}
                        transition={
                          i === index && !reduced
                            ? { duration: INTERVAL / 1000, ease: "linear" }
                            : { duration: 0.3 }
                        }
                        className="block h-full origin-left rounded-full bg-gold"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
