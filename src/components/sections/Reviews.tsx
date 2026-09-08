"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Review } from "@/content/types";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { reviewMedia } from "@/components/reviews/media";
import { useUi } from "@/store/useUi";

const AUTOPLAY_MS = 5200;

/**
 * Bosh sahifa va mahsulot sahifasidagi sharhlar bo'limi.
 *
 * Karta BLOG kartasi bilan bir xil (`ReviewCard`) — bo'lim ham,
 * sharhlar sahifasi ham, blog ham bitta qolipda. Ilgari bu yerda
 * o'ziga xos "qo'shtirnoqli" karta bor edi: u saytda boshqa hech
 * qayerda uchramasdi va sharh ochilganda hech narsa bo'lmasdi —
 * matn kartaning ichida qirqilgancha qolardi.
 */
export function Reviews({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("reviews");
  const tp = useTranslations("reviewsPage");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();
  const openOverlay = useUi((s) => s.open);

  /** Modalda ochilgan sharh. `null` — yopiq. */
  const [open, setOpen] = useState<Review | null>(null);

  const [emblaRef, embla] = useEmblaCarousel(
    { align: "start", loop: true, containScroll: "trimSnaps", watchDrag: !reduced },
    // §14 — harakat kamaytirilgan bo'lsa autoplay umuman ulanmaydi.
    reduced
      ? []
      : [Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })],
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
      takrorlanmasdi. Endi rosewood fon emas, URG'U: tasdiq belgisi va
      video nishoni. Sirt esa greige — krem bilan alabaster orasidagi
      uchinchi zina.
    */
    <section
      id="reviews"
      className="relative isolate scroll-mt-28 border-y border-taupe/25 bg-greige/45 py-20 sm:py-24"
    >
      <div className="relative container-lux">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="relative mt-12">
          <div className="overflow-hidden" ref={emblaRef} aria-label={t("carouselAria")}>
            <div className="flex items-stretch gap-4">
              {reviews.map((review) => (
                /*
                  Slayd kengligi TASHQI o'ramda: `ReviewCard` panjarada
                  ham, karuselda ham ishlatiladi va o'z kengligini
                  bilmasligi kerak.
                */
                <div
                  key={review._id}
                  className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%]"
                >
                  <ReviewCard
                    review={review}
                    locale={locale}
                    /* Karusel ichida kirish animatsiyasi yo'q — izohi kartada. */
                    reveal={false}
                    onOpen={() => setOpen(review)}
                    labels={{
                      ratingAria: t("ratingAria", { rating: review.rating }),
                      verified: t("verified"),
                      photos: t("photosCount", {
                        count: reviewMedia(review).filter((i) => i.kind === "photo").length,
                      }),
                      video: t("watchVideo"),
                      readMore: tp("readMore"),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <NavButton label={t("carouselAria")} onClick={scrollPrev} disabled={!canPrev}>
              <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" />
            </NavButton>
            <NavButton label={t("carouselAria")} onClick={scrollNext} disabled={!canNext}>
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </NavButton>

            {/*
              Karusel BARCHASINI ko'rsatmaydi — u tanlanganini
              aylantiradi. Qolganiga yo'l shu havola.
            */}
            <Link
              href="/reviews"
              className="group ms-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-gold-deep transition-colors duration-300 hover:text-gold-ink"
            >
              {tp("all")}
              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
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

      {/* Sharh qayerda bosilmasin — bir xil modal ochiladi. */}
      <ReviewDialog review={open} locale={locale} onClose={() => setOpen(null)} />
    </section>
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
