"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Element ko'rish maydoniga **har safar** kirganda oshadigan hisoblagich.
 *
 * Ikki vazifani bajaradi:
 *  1. Og'ir animatsiyani kechiktiradi — GSAP tween'i hydration paytida
 *     emas, element haqiqatan kerak bo'lganda quriladi (`DrawSVG` yo'l
 *     uzunligini, `SplitText` qator chegaralarini o'lchaydi, bular
 *     majburiy layout).
 *  2. Qayta ishga tushirish signali beradi — qiymat o'zgargani uchun
 *     `useGSAP` bog'liqliklari yangilanadi va animatsiya boshidan
 *     o'ynaydi. Ya'ni effekt pastga ham, yuqoriga ham scroll qilganda
 *     ishlaydi, bir martalik emas.
 *
 * Ikkita umumiy observer: biri kirishni (82% chizig'ida), ikkinchisi
 * to'liq chiqishni kuzatadi — chiqmasdan turib qayta hisoblanmasligi uchun.
 */
type Entry = { bump: () => void; arm: () => void };

let enterObserver: IntersectionObserver | null = null;
let exitObserver: IntersectionObserver | null = null;
const entries = new WeakMap<Element, Entry>();

function getEnterObserver(): IntersectionObserver {
  enterObserver ??= new IntersectionObserver(
    (list) => {
      for (const e of list) if (e.isIntersecting) entries.get(e.target)?.bump();
    },
    { rootMargin: "0px", threshold: 0 },
  );
  return enterObserver;
}

function getExitObserver(): IntersectionObserver {
  exitObserver ??= new IntersectionObserver(
    (list) => {
      for (const e of list) if (!e.isIntersecting) entries.get(e.target)?.arm();
    },
    { threshold: 0 },
  );
  return exitObserver;
}

/**
 * Qaytaradi: 0 — hali ko'rinmadi; 1, 2, 3… — necha marta ko'rish maydoniga
 * kirgani. Chaqiruvchi shu qiymatni animatsiya bog'liqligi sifatida
 * ishlatadi.
 */
export function useInView(ref: RefObject<Element | null>): number {
  const [plays, setPlays] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // `armed` — element ekrandan chiqqach yana hisoblashga ruxsat beradi.
    // Usiz IntersectionObserver chegara yaqinida bir necha marta ishga
    // tushib, animatsiyani takror-takror uzib qo'yishi mumkin.
    let armed = true;

    entries.set(el, {
      bump: () => {
        if (!armed) return;
        armed = false;
        setPlays((n) => n + 1);
      },
      arm: () => {
        armed = true;
      },
    });

    const enter = getEnterObserver();
    const exit = getExitObserver();
    enter.observe(el);
    exit.observe(el);

    return () => {
      enter.unobserve(el);
      exit.unobserve(el);
      entries.delete(el);
    };
  }, [ref]);

  return plays;
}
