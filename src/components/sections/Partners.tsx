"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Partner } from "@/content/types";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Uch qator: har biri ro'yxatni boshqa nuqtadan boshlaydi va o'z
 * tezligiga ega. O'rtadagisi teskari aylanadi.
 */
const ROWS = [
  { duration: 52, pick: <T,>(a: T[]) => a },
  { duration: 64, pick: <T,>(a: T[]) => [...a.slice(5), ...a.slice(0, 5)] },
  { duration: 46, pick: <T,>(a: T[]) => [...a.slice(9), ...a.slice(0, 9)] },
];

/**
 * Cheksiz marquee (§9 imzo harakati).
 *
 * Ro'yxat ikki marta chiziladi va lenta aynan yarmiga siljiydi —
 * shuning uchun ulanish joyi ko'rinmaydi (seamless). Harakat CSS
 * animatsiyasida: JS kadr sanamaydi, scroll paytida bepul ishlaydi.
 * §14 — reduced-motion'da animatsiya to'xtaydi va lenta statik grid
 * bo'lib qoladi.
 */
export function Partners({ partners }: { partners: Partner[] }) {
  const t = useTranslations("partners");
  const reduced = useReducedMotion();

  return (
    <section className="bg-greige/45 py-20 sm:py-24 border-y border-taupe/25">
      <div className="container-lux">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      </div>

      {reduced ? (
        <ul
          aria-label={t("marqueeAria")}
          className="container-lux mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-5"
        >
          {partners.map((p) => (
            <li key={p._id} className="grid place-items-center">
              <PartnerLogo partner={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative mt-12 space-y-3 sm:space-y-4">
          {/* Chekkalarda yumshoq so'nish — lenta "kesilgandek" ko'rinmaydi. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#e9e3dc] to-transparent sm:w-40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#e9e3dc] to-transparent sm:w-40"
          />

          {/*
            Uch qator: o'rtadagisi TESKARI yo'nalishda va biroz sekinroq —
            qatorlar bir-biriga qarama-qarshi harakatlanib, ko'zga
            "tirik" tuyuladi. Har qator ro'yxatning boshqa qismidan
            boshlanadi, shuning uchun logolar ustma-ust tushmaydi.
          */}
          {ROWS.map((row, i) => (
            <MarqueeRow
              key={i}
              partners={row.pick(partners)}
              reverse={i === 1}
              duration={row.duration}
              aria={i === 0 ? t("marqueeAria") : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MarqueeRow({
  partners,
  reverse,
  duration,
  aria,
}: {
  partners: Partner[];
  reverse: boolean;
  duration: number;
  aria?: string;
}) {
  return (
    <div
      className="group relative overflow-hidden"
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <ul
        aria-label={aria}
        className={[
          "flex w-max items-center gap-12 group-hover:[animation-play-state:paused] sm:gap-16",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        ].join(" ")}
      >
        {[...partners, ...partners].map((p, i) => (
          <li
            key={`${p._id}-${i}`}
            // Ikkinchi nusxa faqat bezak — ekran o'quvchi takrorlamasin.
            aria-hidden={i >= partners.length ? "true" : undefined}
            className="shrink-0"
          >
            <PartnerLogo partner={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <Image
      src={partner.logo}
      alt={partner.name}
      width={150}
      height={40}
      className={[
        "h-8 w-auto opacity-45 grayscale sm:h-9",
        "transition-[opacity,filter,transform] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
        // Hover'da logo jonlanadi va biroz ko'tariladi.
        "hover:-translate-y-1 hover:opacity-100 hover:grayscale-0",
      ].join(" ")}
    />
  );
}
