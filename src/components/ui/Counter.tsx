"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { useInView } from "@/hooks/useInView";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

type Props = {
  value: number;
  suffix?: string;
  className?: string;
  /** Yil kabi qiymatlar guruhlanmaydi: `2007`, `2 007` emas. */
  grouped?: boolean;
};

/**
 * 0 dan qiymatgacha sanaydigan raqam (§7 imzo harakati).
 *
 * SSR'da darrov yakuniy son chiziladi — ya'ni JS ishlamasa ham,
 * qidiruv robotlari uchun ham raqam joyida. Animatsiya faqat
 * boyitish; harakat kamaytirilgan bo'lsa umuman ishga tushmaydi.
 */
export function Counter({ value, suffix = "", className, grouped = true }: Props) {
  const locale = useLocale() as Locale;
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  // Sanoq blok ko'ringanda quriladi va har safar 0 dan qayta boshlanadi
  // (ScrollTrigger o'rniga umumiy IntersectionObserver).
  const plays = useInView(ref);

  const format = (n: number) =>
    (grouped ? formatNumber(Math.round(n), locale) : String(Math.round(n))) + suffix;

  useGSAP(
    () => {
      const el = ref.current;
      if (reduced || plays === 0 || !el) return;

      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(counter.n);
        },
      });
    },
    { scope: ref, dependencies: [reduced, value, locale, plays] },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
