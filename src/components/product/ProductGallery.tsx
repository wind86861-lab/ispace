"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Badge, Media } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { DUR, EASE_LUX } from "@/lib/motion";
import { isVideoSrc } from "@/components/ui/SmartMedia";
import { ProductBadges } from "@/components/catalog/ProductBadges";

/**
 * Mahsulot galereyasi.
 *
 * Rasm bitta bo'lsa kichik rasmlar qatori ham, o'q tugmalari ham
 * chizilmaydi — bo'sh boshqaruv ko'rsatishdan ko'ra ularni umuman
 * bermagan ma'qul.
 */
export function ProductGallery({
  images,
  badges = [],
  footer,
}: {
  images: Media[];
  /**
   * Rasm OSTIDA, u bilan bir vertikal chiziqda chiziladigan blok
   * (mahsulot xususiyatlari).
   *
   * Nega shu yerda: kichik kadrlar ustuni chapda joy egallaydi va
   * rasm undan `5.25rem` ga suriladi. Blok sahifada alohida turganda
   * bu surilishni bilmasdi va kadrlar chizig'idan boshlanardi —
   * ikki element bir-biriga tekislanmasdi. Endi surilish BIR joyda.
   */
  footer?: ReactNode;
  /**
   * Mahsulotga biriktirilgan nishonlar — kartadagi bilan bir xil
   * ustun, asosiy kadr ustida. Ilgari ular faqat katalog kartasida
   * ko'rinardi va mahsulot sahifasiga o'tilganda yo'qolib qolardi.
   */
  badges?: Badge[];
}) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const [index, setIndex] = useState(0);

  /*
   * Bittadan ko'p bo'lsa kichik kadrlar qatori va o'qlar chiziladi.
   * Video ham shu ro'yxatning oddiy a'zosi — alohida yo'l qilinmadi:
   * admin uni rasm bilan bir qatorda yuklaydi va tartibini o'zi
   * belgilaydi.
   */
  const many = images.length > 1;
  const current = images[Math.min(index, images.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    /*
     * Ustunlar balandligi BIR XIL bo'lishi kerak: rasm va kichik
     * kadrlar bir chiziqda tugasin.
     *
     * `flex` bilan bunga erishib bo'lmadi — qator balandligi ikkala
     * ustundan qay biri baland bo'lsa o'shanga tenglashadi, ya'ni
     * kadrlar rasmdan uzun bo'lsa rasm ostida bo'sh tasma qolardi,
     * qisqa bo'lsa kadrlar rasmdan oldin tugardi.
     *
     * Shuning uchun `sm` dan boshlab kadrlar ustuni ABSOLYUT: o'rov
     * balandligini faqat rasm belgilaydi, ustun esa `inset-y-0` bilan
     * aynan shu balandlikni oladi. Sig'magan kadrlar aylantiriladi.
     *
     * Tor ekranda hammasi oddiy oqimda qoladi: u yerda kadrlar rasm
     * OSTIDA gorizontal qator bo'lib turadi.
     */
    <div className="relative flex flex-col-reverse gap-3">
      {many && (
        <ul
          className={[
            "flex gap-3",
            // 72px kadr + 12px oraliq = 84px (5.25rem) — rasm shu qadar suriladi.
            "sm:absolute sm:inset-y-0 sm:left-0 sm:w-[4.5rem] sm:flex-col sm:overflow-y-auto",
          ].join(" ")}
          aria-label={t("gallery")}
        >
          {images.map((m, i) => (
            <li key={m.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                className={[
                  "relative size-16 shrink-0 overflow-hidden rounded-xl border bg-cream transition-colors duration-300 sm:size-[4.5rem]",
                  i === index ? "border-gold/70" : "border-taupe/30 hover:border-gold/40",
                ].join(" ")}
              >
                {isVideoSrc(m.src) ? (
                  <>
                    <video
                      src={m.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full object-cover"
                    />
                    {/* Kichik kadrda video ekani ko'rinib tursin. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 grid place-items-center bg-espresso/25"
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-warm-white/90 text-espresso">
                        <Play size={12} strokeWidth={1.8} fill="currentColor" />
                      </span>
                    </span>
                  </>
                ) : (
                  <Image
                    src={m.src}
                    alt={pick(m.alt, locale)}
                    fill
                    quality={IMAGE_QUALITY}
                    sizes="80px"
                    style={mediaFit(m).style}
                    className={mediaFit(m).className}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={many ? "sm:ms-[5.25rem]" : ""}>
      <div className="relative overflow-hidden rounded-2xl border border-taupe/30 bg-cream">
        {/*
          Ramka SOBIT va BALAND (4:3, katta ekranda 5:4).
          
          Nisbatni faylning o'zidan olib ko'rdik — u mantiqan to'g'ri
          edi, lekin amalda ustun juda past bo'lib qolardi: keng
          (masalan 500×273) foto yuklansa, butun galereya o'ng
          ustunning yarmicha ham kelmasdi.
          
          Kesish esa `mediaFit` ga qoldiriladi: xona fotosi `cover`
          bilan ramkani to'ldiradi (kompozitsiya markazda), oq fonli
          mahsulot fotosi esa `contain` bilan butunlay ko'rinadi —
          uni kesish mumkin emas, buyum chetdan qirqilib qolardi.
        */}
        <div className="relative aspect-[4/3] lg:aspect-[5/4]">
          {/*
            Rasm almashuvi keskin emas, yumshoq: eskisi so'nadi, yangisi
            biroz kattalikdan joyiga keladi. Keskin almashuv kichik
            rasmni bosganda "sakrash" bo'lib ko'rinardi.

            `mode="wait"` ATAYLAB emas — u eski rasm butunlay yo'qolguncha
            kutadi va o'rtada bo'sh kadr paydo bo'ladi. Bu yerda ikkalasi
            bir vaqtda turadi, ya'ni haqiqiy crossfade.
          */}
          <AnimatePresence initial={false}>
            <motion.div
              key={current.src}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.reveal, ease: EASE_LUX }}
              className="absolute inset-0"
            >
              {/*
                Galereyada video ham bo'lishi mumkin. Asosiy kadrda u
                BOSHQARUVLI pleyer: bu mahsulotning o'zi haqidagi
                material, foydalanuvchi uni to'xtatishi va orqaga
                surishi kerak. Fon videolaridan farqi ham shu —
                u yerda boshqaruv yo'q.
              */}
              {isVideoSrc(current.src) ? (
                <video
                  src={current.src}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={pick(current.alt, locale)}
                  className="size-full bg-espresso object-contain"
                />
              ) : (
                <Image
                  src={current.src}
                  alt={pick(current.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  style={mediaFit(current).style}
                  className={mediaFit(current).className}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <ProductBadges badges={badges} locale={locale} />

        {many && (
          <>
            <GalleryArrow side="start" label={t("prevImage")} onClick={() => go(-1)} />
            <GalleryArrow side="end" label={t("nextImage")} onClick={() => go(1)} />
          </>
        )}
      </div>

      {footer && <div className="mt-8">{footer}</div>}
      </div>
    </div>
  );
}

function GalleryArrow({
  side,
  label,
  onClick,
}: {
  side: "start" | "end";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "start" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full",
        "border border-taupe/40 bg-warm-white/95 text-espresso-soft backdrop-blur-sm",
        "transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink",
        // Tugma butunlay rasm ustida turadi: chekkada yarmi ramka
        // chizig'iga tushib, kesilgandek ko'rinardi.
        side === "start" ? "start-4" : "end-4",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
    </button>
  );
}
