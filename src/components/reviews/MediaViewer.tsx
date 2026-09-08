"use client";

import { useCallback, type KeyboardEvent } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { IMAGE_QUALITY } from "@/lib/media";
import { DUR, EASE_LUX } from "@/lib/motion";
import type { ViewerItem } from "./media";

/**
 * Sharh mediasi uchun to'liq ekran ko'ruvchi.
 *
 * Nega umumiy `Modal` EMAS: bu oyna sharh modalining USTIDA ochiladi,
 * `Modal` esa ochilganda Lenis scroll'ini to'xtatadi va yopilganda
 * qaytadan yoqadi. Ikkinchi qavat yopilganda u ostidagi sharh modali
 * hali ochiq bo'lsa ham sahifa suriladigan bo'lib qolardi. Bu yerda
 * scroll'ga umuman tegilmaydi — uni pastdagi modal allaqachon
 * ushlab turibdi.
 */
export function MediaViewer({
  items,
  index,
  onIndex,
  onClose,
  locale,
  label,
}: {
  items: ViewerItem[];
  /** `null` — ko'ruvchi yopiq. */
  index: number | null;
  onIndex: (next: number) => void;
  onClose: () => void;
  locale: Locale;
  /** Ekran o'quvchi uchun nom — sharh muallifi. */
  label: string;
}) {
  const t = useTranslations("common");

  const open = index !== null && items.length > 0;
  const current = open ? items[index] : null;
  const many = items.length > 1;

  /* Aylanma: oxirgisidan keyin birinchisi — tupikka tushmaydi. */
  const step = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (!many) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open && current && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.ui, ease: EASE_LUX }}
                /* Sharh modali `z-[80]` da — bu undan yuqorida. */
                className="fixed inset-0 z-[90] bg-espresso/80 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount onKeyDown={onKeyDown}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: DUR.ui, ease: EASE_LUX }}
                className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-8"
              >
                <Dialog.Title className="sr-only">{label}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  {label}
                </Dialog.Description>

                {/*
                  Ramkadan TASHQARIDAGI bosish yopadi: to'liq ekran
                  ko'ruvchida bu kutilgan xatti-harakat va telefonda
                  kichik X tugmasini nishonga olishdan tezroq.
                */}
                <button
                  type="button"
                  aria-label={t("close")}
                  onClick={onClose}
                  className="absolute inset-0 cursor-zoom-out"
                />

                <div className="relative w-full max-w-5xl">
                  {current.kind === "photo" && (
                    <div className="relative mx-auto h-[68svh] w-full">
                      <Image
                        src={current.media.src}
                        alt={pick(current.media.alt, locale)}
                        fill
                        quality={IMAGE_QUALITY}
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        /*
                          `contain` — kesish YO'Q. Ko'ruvchining butun
                          maqsadi rasmni TO'LIQ ko'rsatish; `cover`
                          bo'lsa u kartadagidan farq qilmasdi.
                        */
                        className="object-contain"
                      />
                    </div>
                  )}

                  {current.kind === "video" && (
                    /*
                      Admin yuklagan fayl — TO'LIQ pleyer.

                      `controls` bor: bu ko'ruvchi, bezak sirt emas.
                      `autoPlay` `muted` siz ham ishlaydi, chunki video
                      foydalanuvchining o'z bosishidan keyin ochiladi —
                      brauzer buni "user gesture" deb qabul qiladi.
                    */
                    <video
                      key={current.media.src}
                      src={current.media.src}
                      title={pick(current.media.alt, locale) || label}
                      controls
                      autoPlay
                      playsInline
                      className="mx-auto max-h-[68svh] w-full rounded-xl bg-espresso shadow-2xl"
                    />
                  )}

                  {current.kind === "youtube" && (
                    <div className="mx-auto aspect-video w-full overflow-hidden rounded-xl bg-espresso shadow-2xl">
                      {/*
                        Iframe faqat SHU YERDA — ya'ni foydalanuvchi
                        videoni ochganda. Sharh modali ochilishining
                        o'zi YouTube pleyerini tortmaydi (§3).
                      */}
                      <iframe
                        key={current.youtubeId}
                        src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&rel=0`}
                        title={label}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="size-full border-0"
                      />
                    </div>
                  )}

                  {many && (
                    <>
                      <ViewerNav
                        side="start"
                        label={t("prev")}
                        onClick={() => step(-1)}
                      >
                        <ChevronLeft
                          size={20}
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                      </ViewerNav>
                      <ViewerNav
                        side="end"
                        label={t("next")}
                        onClick={() => step(1)}
                      >
                        <ChevronRight
                          size={20}
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                      </ViewerNav>

                      <p className="relative mt-4 text-center text-[13px] tabular-nums text-cream/80">
                        {index + 1} / {items.length}
                      </p>
                    </>
                  )}
                </div>

                <Dialog.Close
                  aria-label={t("close")}
                  className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-espresso/50 text-cream transition-colors duration-300 hover:bg-espresso hover:text-gold sm:top-6 sm:right-6"
                >
                  <X size={18} strokeWidth={1.5} aria-hidden="true" />
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function ViewerNav({
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
        "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full",
        "bg-espresso/50 text-cream transition-colors duration-300 hover:bg-espresso hover:text-gold",
        side === "start" ? "start-2 sm:-start-14" : "end-2 sm:-end-14",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
