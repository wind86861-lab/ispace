"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { useInView } from "@/hooks/useInView";
import { ICONS } from "./icons";
import type { IconName } from "@/content/types";

type Props = {
  name: IconName;
  className?: string;
  /** Chizish boshlanishidagi kechikish (stagger uchun). */
  delay?: number;
  size?: number;
  /**
   * `true` — ko'rish maydonini kutmasdan, mount bo'lishi bilan chiziladi.
   * Ekran ustidagi ikonlar uchun shart: `fromTo` ning "0%" holati darrov
   * qo'llanadi va aks holda ikon foydalanuvchi scroll qilmaguncha
   * ko'rinmay qoladi.
   */
  immediate?: boolean;
};

/**
 * Chiziqli ikon **chizilib chiqadi** — bu "Преимущества" bo'limining
 * imzo harakati.
 *
 * DrawSVGPlugin har bir shaklning uzunligini o'lchaydi (majburiy layout),
 * shuning uchun ekran ostidagi ikonlar uchun tween faqat element
 * yaqinlashganda quriladi — sahifa yuklanishida emas.
 */
export function DrawIcon({ name, className, delay = 0, size = 28, immediate = false }: Props) {
  const Icon = ICONS[name];
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  // `plays` har kirishda oshadi → useGSAP qayta ishga tushadi va ikon
  // pastga ham, yuqoriga ham scroll qilganda qaytadan chiziladi.
  const plays = useInView(ref);
  const ready = immediate || plays > 0;

  useGSAP(
    () => {
      const el = ref.current;
      if (reduced || !ready || !el) return;

      const shapes = el.querySelectorAll<SVGGeometryElement>(
        "path, circle, line, rect, polyline, polygon, ellipse",
      );
      if (!shapes.length) return;

      gsap.fromTo(
        shapes,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 1.1,
          ease: "power2.inOut",
          stagger: 0.12,
          delay,
        },
      );
    },
    { scope: ref, dependencies: [reduced, delay, ready, plays] },
  );

  return (
    <span ref={ref} className={className}>
      <Icon size={size} strokeWidth={1.25} aria-hidden="true" />
    </span>
  );
}
