"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import type { Media } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { useReducedMotion } from "@/hooks/useMediaTier";

/**
 * Filial fotolari.
 *
 * Bitta rasm bo'lsa — shunchaki rasm: strelkalar, nuqtalar va
 * hisoblagich hech narsa qo'shmaydi, faqat sirtni shovqinga
 * to'ldiradi. Ikkitadan boshlab slayderga aylanadi.
 *
 * Karusel ATAYLAB avtomatik aylanmaydi: bu mahsulot vitrinasi emas,
 * aniq filialning fotolari — foydalanuvchi ularni O'ZI ko'rib
 * chiqadi va o'zgarib turgan rasm faqat xalaqit berardi.
 */
export function BranchGallery({
  photos,
  locale,
  label,
}: {
  photos: Media[];
  locale: Locale;
  /** Ekran o'quvchi uchun nom — filial nomi. */
  label: string;
}) {
  const t = useTranslations("common");
  const reduced = useReducedMotion();

  const [emblaRef, embla] = useEmblaCarousel({
    loop: photos.length > 2,
    align: "start",
    watchDrag: !reduced,
  });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const update = () => setIndex(embla.selectedScrollSnap());
    update();
    embla.on("select", update).on("reInit", update);
    return () => {
      embla.off("select", update).off("reInit", update);
    };
  }, [embla]);

  /*
   * Filial almashganda karusel BOSHIGA qaytadi. Usiz yangi filialning
   * fotolari uchinchi slayddan ochilardi — oldingisida qayerda
   * to'xtagan bo'lsak.
   */
  useEffect(() => {
    embla?.scrollTo(0, true);
  }, [embla, photos]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  if (photos.length === 0) return null;

  const single = photos.length === 1;

  return (
    /*
      Galereya USTUN BALANDLIGINI to'ldiradi.

      Ilgari ramka `aspect-[4/3]` bilan qat'iy edi va chap ustun
      (ma'lumot + xarita) undan ancha baland bo'lardi: o'lchov 653px
      ga qarshi 377px ko'rsatdi, ya'ni rasm ostida 275px bo'sh joy
      qolardi. Endi ramka qolgan balandlikni oladi, nuqtalar esa
      pastda o'z joyida turadi.

      Telefonda ustunlar ustma-ust, shuning uchun u yerda nisbat
      saqlanadi — aks holda rasm cho'zilib ketardi.
    */
    <div className="group relative lg:flex lg:h-full lg:flex-col">
      <div
        className="overflow-hidden rounded-2xl border border-taupe/30 bg-cream lg:min-h-0 lg:flex-1"
        ref={single ? undefined : emblaRef}
        aria-label={label}
      >
        <div className={single ? "lg:h-full" : "flex lg:h-full"}>
          {photos.map((m, i) => (
            <div
              key={m.src || i}
              className={[
                "relative aspect-[4/3] min-w-0 lg:aspect-auto lg:h-full",
                single ? "" : "flex-[0_0_100%]",
              ].join(" ")}
            >
              <Image
                src={m.src}
                alt={pick(m.alt, locale)}
                fill
                quality={IMAGE_QUALITY}
                sizes="(max-width: 1024px) 100vw, 42vw"
                style={mediaFit(m).style}
                className={mediaFit(m).className}
              />
            </div>
          ))}
        </div>
      </div>

      {!single && (
        <>
          {/*
            Strelkalar rasm USTIDA va faqat kursor ostida ko'rinadi:
            fotoni yopib turmasin. Telefonda ular baribir kerak emas —
            u yerda surib o'tiladi, shuning uchun `sm:` dan boshlab.
          */}
          <NavButton side="start" label={t("prev")} onClick={prev}>
            <ChevronLeft size={18} strokeWidth={1.7} aria-hidden="true" />
          </NavButton>
          <NavButton side="end" label={t("next")} onClick={next}>
            <ChevronRight size={18} strokeWidth={1.7} aria-hidden="true" />
          </NavButton>

          <div className="mt-3 flex shrink-0 items-center justify-between gap-4">
            {/* Nuqtalar — bosiladigan: to'g'ridan-to'g'ri kerakli fotoga. */}
            <ul className="flex items-center gap-1.5">
              {photos.map((m, i) => (
                <li key={m.src || i}>
                  <button
                    type="button"
                    onClick={() => embla?.scrollTo(i)}
                    aria-label={`${i + 1} / ${photos.length}`}
                    aria-current={i === index}
                    className={[
                      "block h-1.5 rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                      i === index ? "w-6 bg-gold-deep" : "w-1.5 bg-taupe/50 hover:bg-taupe",
                    ].join(" ")}
                  />
                </li>
              ))}
            </ul>

            <span className="text-[12px] tabular-nums text-espresso-soft/85">
              {index + 1} / {photos.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function NavButton({
  side,
  label,
  onClick,
  children,
}: {
  side: "start" | "end";
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "absolute top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full sm:grid",
        "bg-warm-white/85 text-espresso-soft backdrop-blur-sm transition-[opacity,color,background-color] duration-300",
        "opacity-0 group-hover:opacity-100 hover:text-gold-ink focus-visible:opacity-100",
        side === "start" ? "start-3" : "end-3",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
