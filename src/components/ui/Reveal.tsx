"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useRevealObserver } from "@/hooks/useRevealObserver";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Sekundlarda — orkestrda ketma-ketlikni sozlash uchun. */
  delay?: number;
  /** Pastdan ko'tarilish masofasi (px). */
  y?: number;
  /**
   * `true` bo'lsa bevosita bolalar ketma-ket (stagger) chiqadi,
   * son berilsa — bolalar orasidagi kechikish (sekund).
   */
  stagger?: boolean | number;
  /**
   * Kirish turi:
   *  · `up`    — pastdan ko'tarilish (sukut bo'yicha);
   *  · `smoke` — xiralikdan tiniqlashish (blur), uzun matnlar uchun;
   *  · `mask`  — pastdan "parda" ochilishi, rasm va yaxlit bloklar uchun.
   * Hammasi bitta umumiy kuzatuvchidan boshqariladi.
   */
  variant?: "up" | "smoke" | "mask";
};

/**
 * Sayt bo'ylab yagona kirish harakati.
 *
 * Harakat CSS transition'da, ishga tushirish esa umumiy
 * IntersectionObserver'da (`useRevealObserver`) — shuning uchun 34 ta
 * blok uchun ham asosiy oqimda deyarli ish qolmaydi.
 *
 * `data-reveal` CSS bilan bog'liq: element faqat `html[data-motion="on"]`
 * bo'lganda yashiriladi. JS ishlamasa yoki harakat kamaytirilgan bo'lsa —
 * kontent ko'rinib turadi va hech qachon "opacity:0 da qolib ketmaydi".
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 38,
  stagger = false,
  variant = "up",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  useRevealObserver(ref, stagger === true ? 0.14 : stagger === false ? false : stagger);

  const style = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delay}s`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      {...(stagger === false
        ? { "data-reveal": variant === "up" ? "" : variant }
        : { "data-reveal-group": "" })}
    >
      {children}
    </Tag>
  );
}
