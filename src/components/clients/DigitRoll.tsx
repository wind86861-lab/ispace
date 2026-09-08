"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { useInView } from "@/hooks/useInView";
import { motionEnabled } from "@/lib/motion";

/**
 * Raqam belgi-belgi bo'lib maskadan **ko'tariladi**.
 *
 * Nega `Counter` emas: sanoqchi faqat sonlar bilan ishlaydi, bu yerda
 * esa «1–3», «30%», «500 000» kabi qiymatlar bor — ularni sanab
 * bo'lmaydi. Maska esa har qanday matnda ishlaydi va harakat ma'nosi
 * bir xil qoladi: "raqam joyiga tushdi".
 *
 * Har belgi o'z `overflow-hidden` uyasida yotadi, ya'ni u pastdan
 * chiqib kelayotgandek ko'rinadi. Harakat faqat `transform` bilan —
 * layout qayta hisoblanmaydi.
 */
export function DigitRoll({
  value,
  className = "",
  delay = 0,
}: {
  value: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const plays = useInView(ref);

  useGSAP(
    () => {
      if (reduced || !motionEnabled() || plays === 0 || !ref.current) return;

      gsap.fromTo(
        ref.current.querySelectorAll("[data-digit]"),
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.75,
          delay,
          /*
             Yengil "overshoot": raqam joyiga tushib, bir zumda
             qaytadi. Bu og'irlik hissini beradi — sof `power3` esa
             qog'ozdek yengil ko'rinardi.
          */
          ease: "back.out(1.4)",
          stagger: 0.045,
        },
      );
    },
    { scope: ref, dependencies: [reduced, plays, delay] },
  );

  return (
    /*
      Matn DOM'da BUTUN qoladi: nusxa ko'chirish va qidiruv ishlaydi,
      ekran o'quvchi esa belgilarni bittalab o'qimaydi.
    */
    <span ref={ref} className={className} aria-label={value}>
      {[...value].map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
          /*
            Bo'sh joy ham uya bo'ladi, aks holda so'zlar yopishib
            qolardi. Ichida esa UZILMAYDIGAN bo'shliq: oddiy bo'shliq
            `overflow-hidden` uyasi ichida yig'ilib yo'q bo'lardi va
            «500 000» ekranda «500000» bo'lib chiqardi.
          */
          style={{ lineHeight: 1.1 }}
        >
          <span data-digit className="inline-block">
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </span>
  );
}
