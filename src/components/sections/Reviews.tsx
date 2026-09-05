"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BadgeCheck, Play, Star } from "lucide-react";
import type { Review } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatDate } from "@/lib/format";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { useInView } from "@/hooks/useInView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { useUi } from "@/store/useUi";

const AUTOPLAY_MS = 5200;

export function Reviews({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("reviews");
  const reduced = useReducedMotion();
  const openOverlay = useUi((s) => s.open);

  const [emblaRef, embla] = useEmblaCarousel(
    { align: "start", loop: true, containScroll: "trimSnaps", watchDrag: !reduced },
    // §14 — harakat kamaytirilgan bo'lsa autoplay umuman ulanmaydi.
    reduced ? [] : [Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const update = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    update();
    embla.on("select", update).on("reInit", update);
    return () => {
      embla.off("select", update).off("reInit", update);
    };
  }, [embla]);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    /*
      Sharhlar YENGIL sirtda.

      U bir vaqtlar to'liq rosewood fonda edi — sahifada yolg'iz
      "qizil plita" bo'lib turardi va rang boshqa hech qayerda
      takrorlanmasdi. Endi rosewood fon emas, URG'U: qo'shtirnoq,
      tasdiq belgisi va reyting soni. Sirt esa greige — krem bilan
      alabaster orasidagi uchinchi zina.
    */
    <section
      id="reviews"
      className="relative isolate scroll-mt-28 border-y border-taupe/25 bg-greige/45 py-20 sm:py-24"
    >
      <div className="relative container-lux">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="relative mt-12">
          <div className="overflow-hidden" ref={emblaRef} aria-label={t("carouselAria")}>
            <div className="flex gap-4">
              {reviews.map((review) => (
                <article
                  key={review._id}
                  className={[
                    "group relative isolate flex min-w-0 flex-[0_0_88%] flex-col overflow-hidden",
                    "rounded-2xl border border-taupe/30 bg-warm-white p-6",
                    "transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                    "hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_18px_50px_-32px_rgba(41,34,30,0.55)]",
                    "sm:flex-[0_0_46%] lg:flex-[0_0_23.5%]",
                  ].join(" ")}
                >
                  {/* Kursor ostida yuqoridan iliq yog'du yonadi. */}
                  <span
                    aria-hidden="true"
                    className="review-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/*
                    Qo'shtirnoq — bezak, matn EMAS: ekran o'quvchi uni
                    o'qimasligi kerak, aks holda har sharh «kavichka» dan
                    boshlanardi.
                  */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-4 font-display text-[5.5rem] leading-none text-rosewood/14 transition-colors duration-500 select-none group-hover:text-rosewood/26"
                  >
                    &rdquo;
                  </span>

                  <Stars rating={review.rating} />
                  {/*
                    Karusel ichida kirish animatsiyasi YO'Q.

                    `Reveal` ko'rish maydoni kuzatuvchisiga tayanadi,
                    slaydlar esa gorizontal kesiladi: karusel siljiganda
                    karta "ekrandan chiqdi" deb hisoblanib yashirinadi va
                    qaytib ochilmasligi mumkin. Ko'rinishni bu yerda
                    karuselning o'zi boshqaradi.
                  */}
                  <div className="flex flex-1 flex-col">
                    <ReviewBody review={review} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <NavButton label={t("carouselAria")} onClick={scrollPrev} disabled={!canPrev}>
              <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" />
            </NavButton>
            <NavButton label={t("carouselAria")} onClick={scrollNext} disabled={!canNext}>
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </NavButton>
          </div>
        </div>

        {/* ---- test-drayv CTA ---- */}
        <div className="mt-12 flex flex-col items-start gap-6 rounded-2xl border border-rosewood/25 bg-warm-white p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <Reveal stagger={0.1}>
            <h3 className="font-display text-2xl text-espresso">{t("cta.title")}</h3>
            <p className="measure mt-2 text-[14px] leading-relaxed text-espresso-soft">
              {t("cta.text")}
            </p>
          </Reveal>
          <Magnetic strength={0.3}>
            <Button variant="gold" size="lg" withArrow onClick={() => openOverlay("consult")}>
              {t("cta.button")}
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/**
 * Sharh mazmuni: matn, media va imzo.
 *
 * Kompozitsiya ataylab "gazeta" emas, "odam" tomon: pastda avatar bilan
 * imzo turadi va «tasdiqlangan xarid» belgisi bor. Sharh sotuvda ishonch
 * hosil qiladi, ishonch esa aniq odamdan keladi — shuning uchun ism
 * kartaning eng ko'zga tashlanadigan qismlaridan biri.
 */
function ReviewBody({ review }: { review: Review }) {
  const t = useTranslations("reviews");
  const locale = useLocale() as Locale;
  const openVideo = useUi((s) => s.setVideoOpen);

  /*
   * Faqat HAQIQATAN yuklangan fotolar. Sayt bo'ylab bir xil qoida:
   * yuklanmagan rasm o'rniga bo'sh o'rindosh ramka ko'rsatilmaydi.
   */
  const photos = (review.photos ?? []).filter((m) => m.uploaded === true);
  const author = pick(review.author, locale);

  /*
   * Avatar — foto emas, ism harflari.
   *
   * Mijozdan portret so'rash ham, uni saqlash ham keraksiz: ikkita harf
   * kartani "jonli" qilish uchun yetarli va u har doim bor, hech qachon
   * bo'sh ramka bo'lib qolmaydi.
   */
  const initials = author
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <>
      <p className="mt-4 flex-1 text-[14.5px] leading-relaxed text-espresso-soft">
        {pick(review.text, locale)}
      </p>

      {(photos.length > 0 || review.youtubeId) && (
        <div className="mt-5">
          {/*
            Media BITTA qatorda qoladi.

            Karta tor: 1440px ekranda ichki kenglik ~249px, ya'ni 72px
            plitkadan uchtasi sig'adi (216 + 2×8 = 232). To'rtinchisi
            qatorni buzib, kartalar balandligini tenglashtirmay qo'yardi.
            Shuning uchun plitka byudjeti — uchta, video ham shundan
            bittasini oladi. Umumiy son pastdagi izohda aytiladi, ya'ni
            hech qanday ma'lumot yo'qolmaydi.
          */}
          <ul className="flex items-center gap-2">
            {photos.slice(0, review.youtubeId ? 2 : 3).map((m) => (
              <li key={m.src}>
                <span className="relative block size-[4.5rem] overflow-hidden rounded-xl border border-taupe/30 bg-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:scale-[1.06]">
                  <Image
                    src={m.src}
                    alt={pick(m.alt, locale)}
                    fill
                    quality={IMAGE_QUALITY}
                    sizes="72px"
                    style={mediaFit(m).style}
                    className={mediaFit(m).className}
                  />
                </span>
              </li>
            ))}

            {review.youtubeId && (
              <li>
                {/*
                  Video lightbox'da ochiladi — kartaga o'rnatilgan iframe
                  har sharh uchun alohida YouTube pleyerini yuklab,
                  sahifani sezilarli og'irlashtirardi.
                */}
                <button
                  type="button"
                  onClick={() => openVideo(true)}
                  aria-label={`${t("watchVideo")} — ${author}`}
                  className="group/v grid size-[4.5rem] place-items-center rounded-xl bg-espresso text-cream transition-colors duration-300 hover:bg-gold-deep"
                >
                  <Play
                    size={20}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    fill="currentColor"
                    className="transition-transform duration-300 group-hover/v:scale-110"
                  />
                </button>
              </li>
            )}
          </ul>

          <p className="mt-2 text-[12px] text-espresso-soft/85">
            {[
              photos.length > 0 ? t("photosCount", { count: photos.length }) : null,
              review.youtubeId ? t("watchVideo") : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}

      <footer className="mt-6 flex items-center gap-3 border-t border-taupe/25 pt-5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-rosewood/12 font-display text-[16px] text-rosewood"
        >
          {initials}
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-[14.5px] text-espresso">{author}</span>
            <span className="inline-flex items-center gap-1 text-[12px] text-rosewood">
              <BadgeCheck size={13} strokeWidth={1.8} aria-hidden="true" />
              {t("verified")}
            </span>
          </span>
          <time
            dateTime={review.publishedAt}
            className="mt-0.5 block text-[12px] text-espresso-soft/85"
          >
            {formatDate(review.publishedAt, locale)}
          </time>
        </span>
      </footer>
    </>
  );
}

/** Yulduzlar `inView` da ketma-ket "to'ladi" (§12 imzo harakati). */
function Stars({ rating }: { rating: number }) {
  const t = useTranslations("reviews");
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const plays = useInView(ref);

  useGSAP(
    () => {
      if (reduced || plays === 0 || !ref.current) return;
      gsap.from(ref.current.querySelectorAll("[data-star]"), {
        opacity: 0,
        scale: 0.4,
        transformOrigin: "50% 50%",
        duration: 0.45,
        ease: "back.out(2.2)",
        stagger: 0.09,
      });
    },
    { scope: ref, dependencies: [reduced, plays] },
  );

  return (
    /*
      `role="img"` majburiy: `aria-label` rolsiz elementda (oddiy <p>)
      ARIA bo'yicha taqiqlangan va ekran o'quvchilar uni e'tiborsiz
      qoldirishi mumkin. Yulduzlar to'plami — bitta grafik, shuning uchun
      `img` roli semantik jihatdan ham to'g'ri.
    */
    <p ref={ref} role="img" className="flex gap-0.5" aria-label={t("ratingAria", { rating })}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} data-star aria-hidden="true">
          <Star
            size={15}
            strokeWidth={1.4}
            className={i < rating ? "text-gold" : "text-taupe-text/40"}
            fill={i < rating ? "currentColor" : "none"}
          />
        </span>
      ))}
    </p>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full border border-taupe/45 text-espresso-soft transition-colors duration-300 hover:border-rosewood/60 hover:text-rosewood disabled:opacity-35"
    >
      {children}
    </button>
  );
}
