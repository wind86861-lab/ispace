"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DUR, STAGGER, TRIGGER_START } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { motionEnabled } from "@/lib/motion";
import { useRevealObserver } from "@/hooks/useRevealObserver";

type Props = {
  /** Ekran o'quvchi uchun to'liq matn — `aria-label` ga tushadi. */
  label: string;
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /**
   * `true` — sarlavha **qatorlab** ochiladi (SplitText).
   *
   * Bu qimmat effekt: SplitText har bir sarlavha uchun DOM'ni bo'lib,
   * qator chegaralarini o'lchaydi — ya'ni majburiy layout. O'lchov
   * ko'rsatdiki, sahifadagi o'nta sarlavhaning hammasiga qo'llash mobil
   * qurilmada asosiy oqimni sezilarli bloklaydi. Shuning uchun u faqat
   * hero sarlavhasida — bir marta, eng ko'rinadigan joyda — ishlatiladi;
   * qolgan sarlavhalar bir butun bo'lib, arzon CSS o'tishida chiqadi.
   */
  cinematic?: boolean;
};

/**
 * Sarlavha ochilishi.
 *
 * A11y kelishuvi (ikkala rejimda ham):
 *  · matn DOM'da butun qoladi → copy-paste va qidiruv ishlaydi;
 *  · sarlavhada `aria-label`, bo'lingan qatlam `aria-hidden` — ekran
 *    o'quvchi harflarni bittalab o'qimaydi;
 *  · bo'lish faqat mount'dan keyin va `document.fonts.ready` dan so'ng →
 *    SSR HTML toza, shrift almashinuvida CLS bo'lmaydi;
 *  · harakat kamaytirilgan bo'lsa hech narsa bo'linmaydi.
 */
export function SplitHeading({
  label,
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  cinematic = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Arzon yo'l: umumiy IntersectionObserver + CSS o'tishi.
  useRevealObserver(cinematic ? { current: null } : ref, false);

  useGSAP(
    () => {
      const el = ref.current;
      if (!cinematic || reduced || !motionEnabled() || !el) return;

      const inner = el.querySelector<HTMLElement>("[data-split]");
      if (!inner) return;

      let split: SplitText | null = null;
      let cancelled = false;

      // Shrift yuklanmasdan bo'lish — qator chegaralari keyin siljiydi
      // va CLS beradi. Shuning uchun kutamiz.
      void document.fonts.ready.then(() => {
        if (cancelled || !inner.isConnected) return;

        split = SplitText.create(inner, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
        });

        gsap.from(split.lines, {
          yPercent: 115,
          duration: DUR.cinematic,
          ease: "expo.out",
          stagger: STAGGER.tight,
          delay,
          scrollTrigger: {
              trigger: el,
              start: TRIGGER_START,
              // Bir martalik emas: pastga scroll qilganda qaytadan
              // o'ynaydi, yuqoriga chiqib ketganda boshlang'ich holatga
              // qaytadi ("reset" — teskari o'ynatmaydi, shunchaki tiklaydi,
              // shuning uchun element ekranda turganda sakrash bo'lmaydi).
              toggleActions: "restart none none reset",
            },
        });
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref, dependencies: [reduced, delay, cinematic], revertOnUpdate: true },
  );

  const style = { "--reveal-y": "22px", "--reveal-delay": `${delay}s` } as CSSProperties;

  return (
    <Tag
      ref={ref}
      aria-label={label}
      className={className}
      style={cinematic ? undefined : style}
      {...(cinematic ? {} : { "data-reveal": "" })}
    >
      <span data-split aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
