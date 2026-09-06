"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "./LenisProvider";

/**
 * Yangi sahifaga o'tilganda scroll TEPAGA qaytadi.
 *
 * Nega bu kerak: Next'ning o'z scroll tiklashi `window.scrollTo` ga
 * tayanadi, saytda esa scroll'ni Lenis boshqaradi. Lenis o'zining
 * ichki holatini yuritadi va Next uni qaytargandan keyin darrov eski
 * joyga qaytarib qo'yadi. Natijada "O'xshash modellar" dan mahsulot
 * tanlansa, yangi sahifa sahifaning O'RTASIDAN ochilardi.
 *
 * `useLayoutEffect` EMAS, `useEffect`: yangi sahifa DOM'i chizilgandan
 * keyin qaytarish kerak, aks holda Lenis eski balandlik bo'yicha
 * hisoblab, noto'g'ri nuqtaga tushadi.
 *
 * Birinchi yuklanish CHETLAB O'TILADI: manzilda langar (`#lead`) bo'lsa
 * yoki foydalanuvchi sahifani o'rtasidan ochgan bo'lsa (brauzer
 * tiklagan holat), uni zo'rlab tepaga tortish noto'g'ri bo'lardi.
 */
export function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    // Langarga o'tish (`#lead`) o'z scroll'ini o'zi hal qiladi.
    if (window.location.hash) return;

    // `immediate` yo'q: bu yerda API sekin siljitadi, shuning uchun
    // native `scrollTo` bilan bir zumda tepaga qo'yamiz va Lenis'ni
    // ham o'sha nuqtaga tenglashtiramiz.
    window.scrollTo({ top: 0, behavior: "auto" });
    lenis.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}
