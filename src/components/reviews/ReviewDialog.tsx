"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Review } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatDate } from "@/lib/format";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { Modal } from "@/components/overlays/Modal";
import { MediaViewer } from "./MediaViewer";
import { Stars } from "./Stars";
import { initialsOf } from "./ReviewCard";
import { countPhotos, countVideos, reviewMedia } from "./media";

/**
 * To'liq sharh — modalda.
 *
 * Blogda karta alohida sahifaga olib boradi, bu yerda alohida sahifa
 * ortiqcha: sharh — bir necha jumla. Modal matnni to'liq, materialni
 * esa bosilganda to'liq ekranda ko'rsatadi, ro'yxatdagi joyni
 * yo'qotmasdan.
 *
 * Bosh sahifadagi karusel ham, sharhlar sahifasi ham SHU komponentni
 * ishlatadi: sharh qayerda bosilmasin, bir xil ochiladi.
 */
export function ReviewDialog({
  review,
  locale,
  onClose,
}: {
  /** `null` — modal yopiq. */
  review: Review | null;
  locale: Locale;
  onClose: () => void;
}) {
  const t = useTranslations("reviews");
  const tp = useTranslations("reviewsPage");

  /** To'liq ekran ko'ruvchidagi joriy element. `null` — yopiq. */
  const [viewer, setViewer] = useState<number | null>(null);

  const items = review ? reviewMedia(review) : [];
  const author = review ? pick(review.author, locale) : "";

  const photos = countPhotos(items);
  const videos = countVideos(items);

  /* Modal yopilganda ko'ruvchi ham tozalanadi. */
  const closeAll = () => {
    setViewer(null);
    onClose();
  };

  /*
    Panel `wide` EMAS, `size="lg"`.

    `wide` — video uchun mo'ljallangan rejim: u panelning o'zini (fon,
    padding, sarlavha) olib tashlaydi. Matnli sharh o'sha rejimda
    sahifa ustida osilib qolardi — na chegara, na sarlavha, na tartib.
  */
  return (
    <>
      <Modal
        size="lg"
        open={review !== null}
        onClose={closeAll}
        title={author}
        description={
          review ? formatDate(review.publishedAt, locale) : undefined
        }
      >
        {review && (
          <>
            {/*
              Baho zonasi — kim va nechchi yulduz qo'ygani BIR qarashda.
              Ilgari yulduzlar sana bilan bitta mayda qatorda turardi.
            */}
            <div className="flex items-center gap-3 rounded-xl border border-taupe/25 bg-cream/60 p-4">
              <span
                aria-hidden="true"
                className="font-display grid size-12 shrink-0 place-items-center rounded-full bg-rosewood/12 text-[18px] text-rosewood"
              >
                {initialsOf(author)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <Stars
                    rating={review.rating}
                    label={t("ratingAria", { rating: review.rating })}
                    size={17}
                  />
                  <span className="font-display text-[17px] leading-none text-espresso">
                    {review.rating},0
                  </span>
                </span>
                <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-rosewood">
                  <BadgeCheck size={13} strokeWidth={1.8} aria-hidden="true" />
                  {t("verified")}
                </span>
              </span>
            </div>

            {/*
              Sharh matni — iqtibos sifatida. Chapdagi oltin chiziq uni
              ostidagi materialdan aniq ajratadi.
            */}
            <blockquote className="mt-6 border-s-2 border-gold/45 ps-5 text-[15.5px] leading-relaxed text-espresso">
              {pick(review.text, locale)}
            </blockquote>

            {items.length > 0 && (
              <section className="mt-7">
                {/*
                  Foto va video BITTA panjarada.

                  Ilgari ular ikki alohida bo'lim edi va video
                  o'rnatilgan pleyer bo'lib turardi: u bosishni o'zi
                  yutardi, ya'ni kattalashtirib bo'lmasdi, ustiga
                  sharh ochilishining o'zi YouTube pleyerini tortardi.
                  Endi hammasi bir xil plitka va faqat bosilganda
                  ochiladi.
                */}
                <p className="text-[11px] tracking-[0.14em] text-espresso-soft/85 uppercase">
                  {[
                    photos > 0 ? t("photosCount", { count: photos }) : null,
                    videos > 0 ? tp("videoCount", { count: videos }) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((item, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setViewer(i)}
                        aria-label={
                          item.kind === "photo"
                            ? pick(item.media.alt, locale) ||
                              t("photosCount", { count: 1 })
                            : `${t("watchVideo")} — ${author}`
                        }
                        className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl border border-taupe/30 bg-cream transition-colors duration-300 hover:border-gold/60"
                      >
                        <MediaThumb item={item} locale={locale} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <button
              type="button"
              onClick={closeAll}
              className="mt-8 w-full rounded-full border border-taupe/40 py-2.5 text-[14px] text-espresso-soft transition-colors duration-300 hover:border-gold/50 hover:text-espresso"
            >
              {tp("close")}
            </button>
          </>
        )}
      </Modal>

      <MediaViewer
        items={items}
        index={viewer}
        onIndex={setViewer}
        onClose={() => setViewer(null)}
        locale={locale}
        label={author}
      />
    </>
  );
}

/**
 * Plitka ichi — turga qarab.
 *
 * Yuklangan videodan `preload="metadata"` bilan BIRINCHI KADR
 * ko'rsatiladi: alohida poster rasm so'ramaymiz (uni admin baribir
 * yuklamasdi), lekin plitka bo'sh qora to'rtburchak ham bo'lib
 * qolmaydi. YouTube'da kadr yo'q — uning fayli bizda emas.
 */
function MediaThumb({
  item,
  locale,
}: {
  item: ReturnType<typeof reviewMedia>[number];
  locale: Locale;
}) {
  if (item.kind === "photo") {
    return (
      <Image
        src={item.media.src}
        alt={pick(item.media.alt, locale)}
        fill
        quality={IMAGE_QUALITY}
        sizes="(max-width: 640px) 45vw, 200px"
        style={mediaFit(item.media).style}
        className={`${mediaFit(item.media).className} transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-105`}
      />
    );
  }

  return (
    <>
      {item.kind === "video" ? (
        <video
          src={item.media.src}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="size-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-espresso to-espresso-soft"
        />
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center bg-espresso/35 transition-colors duration-300 group-hover:bg-espresso/20"
      >
        <span className="grid size-11 place-items-center rounded-full bg-cream/15 text-cream ring-1 ring-cream/40 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-110">
          <Play
            size={16}
            strokeWidth={1.6}
            fill="currentColor"
            aria-hidden="true"
          />
        </span>
      </span>
    </>
  );
}
