"use client";

import { useSyncExternalStore } from "react";

/**
 * Qurilma qobiliyati qatlamlari (§2).
 *
 * `fine` — sichqoncha/trackpad bor: magnetic hover, 3D tilt va ichki
 * parallax **faqat shunda** mount qilinadi (touch'da event listener ham
 * qo'shilmaydi).
 * `reduced` — foydalanuvchi harakatni kamaytirishni so'ragan: hech narsa
 * animatsiya qilinmaydi.
 *
 * SSR'da ikkalasi ham `false` — ya'ni server eng sodda, eng xavfsiz
 * variantni chizadi va hech qanday hydration mismatch bo'lmaydi.
 */
function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION);
}

export function useFinePointer(): boolean {
  return useMediaQuery(FINE_POINTER);
}

export type MediaTier = {
  /** Sichqoncha bor — pointer'ga bog'liq effektlar mumkin. */
  fine: boolean;
  /** Harakat kamaytirilsin — hamma narsa statik. */
  reduced: boolean;
  /** Pointer effektlarini ishlatish mumkinmi (ikkalasi hisobga olingan). */
  pointerFx: boolean;
};

export function useMediaTier(): MediaTier {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return { fine, reduced, pointerFx: fine && !reduced };
}
