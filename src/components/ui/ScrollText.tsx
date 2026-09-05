"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { motionEnabled } from "@/lib/motion";

type Variant = "fill" | "sweep";

type Props = {
  /** Ekran o'quvchi uchun to'liq matn. */
  label: string;
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /**
   * `fill`  — matn scroll bilan **so'zma-so'z yoziladi**: so'zlar oqarib
   *           turgan holatdan to'liq rangga o'tadi.
   * `sweep` — matn bo'ylab oltin yorug'lik yugurib o'tadi.
   */
  variant?: Variant;
};

/**
 * Scroll'ga BOG'LANGAN matn animatsiyasi (`scrub`).
 *
 * Bu boshqa reveal'lardan farq qiladi: bu yerda animatsiya vaqt bilan emas,
 * **scroll pozitsiyasi bilan** boshqariladi — foydalanuvchi qanchalik
 * aylantirsa, matn shunchalik "yoziladi". Orqaga aylantirsa — orqaga qaytadi.
 *
 * Narxi bor: `scrub` har kadrda hisoblanadi, shuning uchun u sanoqli
 * joyda ishlatiladi (uzun matnlar va bitta to'q sarlavha), hamma yerda emas.
 *
 * A11y (§5): matn DOM'da butun qoladi, `aria-label` da to'liq matn,
 * bo'lingan qatlam `aria-hidden`. Harakat kamaytirilgan bo'lsa — hech
 * narsa bo'linmaydi va matn darrov to'liq ko'rinadi.
 */
export function ScrollText({
  label,
  children,
  as: Tag = "p",
  className,
  style,
  variant = "fill",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      // `motionEnabled()` sinxron va birinchi renderdayoq to'g'ri —
      // usiz tween bir marta qurilib, matn xira holatda qolib ketadi.
      if (reduced || !motionEnabled() || !el) return;

      const inner = el.querySelector<HTMLElement>("[data-scroll-text]");
      if (!inner) return;

      if (variant === "sweep") {
        /*
         * Yorug'lik yugurishi: bitta element va bitta xossa
         * (`background-position`) animatsiya qilinadi — o'nlab so'zni
         * alohida haydashdan ancha arzon.
         */
        gsap.fromTo(
          inner,
          { backgroundPosition: "150% 0" },
          {
            backgroundPosition: "-50% 0",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 40%",
              scrub: 0.5,
            },
          },
        );
        return;
      }

      let split: SplitText | null = null;
      let cancelled = false;

      // Shrift yuklanmasdan bo'lish — so'z chegaralari keyin siljiydi.
      void document.fonts.ready.then(() => {
        if (cancelled || !inner.isConnected) return;

        split = SplitText.create(inner, { type: "words", wordsClass: "scroll-word" });

        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.5,
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    // `revertOnUpdate` — bog'liqlik o'zgarganda oldingi tween bekor
    // qilinsin va element o'z holiga qaytsin.
    { scope: ref, dependencies: [reduced, variant], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} aria-label={label} className={className} style={style}>
      <span
        data-scroll-text
        aria-hidden="true"
        className={variant === "sweep" ? "scroll-sweep" : undefined}
      >
        {children}
      </span>
    </Tag>
  );
}
