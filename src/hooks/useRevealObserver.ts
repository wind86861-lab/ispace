"use client";

import { useEffect, type RefObject } from "react";

/**
 * Kirish animatsiyalari uchun umumiy kuzatuvchilar.
 *
 * Animatsiya **har safar** ishlaydi: element ko'rish maydoniga kirganda
 * ochiladi, butunlay chiqib ketganda esa boshlang'ich holatiga qaytadi.
 * Shuning uchun ikkita observer kerak — bittasi ikkala vazifani halol
 * bajara olmaydi:
 *
 *  · `revealObserver` — pastdan 18% qirqilgan maydon bilan: element
 *    yuqori chekkasi ekranning 82% chizig'idan o'tganda ochiladi
 *    (GSAP dagi `start: "top 82%"` ning ekvivalenti).
 *  · `resetObserver` — to'liq ekran bilan: element ekrandan **butunlay**
 *    chiqqanda holat tiklanadi. Agar tiklashni birinchi observer'ga
 *    qo'ysak, element pastki 18% yo'lakchasida turganda — ya'ni hali
 *    ko'rinib turganda — o'chib qolardi.
 *
 * Ikkalasi ham butun sahifa uchun bittadan: har komponentga alohida
 * IntersectionObserver ochish o'zi ham qimmatga tushadi.
 */
let revealObserver: IntersectionObserver | null = null;
let resetObserver: IntersectionObserver | null = null;

function getRevealObserver(): IntersectionObserver {
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.setAttribute("data-revealed", "");
      }
    },
    {
      /*
       * Chegara YO'Q. Salbiy `rootMargin` ("biroz ichkariga kirsin")
       * amalda ekranning pastki yo'lakchasida to'liq ko'rinib turgan
       * elementni ochilmagan holda qoldirardi — foydalanuvchi o'sha
       * joyda to'xtasa, kontent o'rnida bo'sh joy turardi. Ketma-ketlik
       * hissi `--reveal-delay` (stagger) orqali saqlanadi.
       */
      rootMargin: "0px",
      threshold: 0,
    },
  );
  return revealObserver;
}

function getResetObserver(): IntersectionObserver {
  resetObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) entry.target.removeAttribute("data-revealed");
      }
    },
    { threshold: 0 },
  );
  return resetObserver;
}

/**
 * QO'RIQCHI — kontent hech qachon ko'rinmay qolmasligi uchun.
 *
 * Kirish animatsiyasi CSS bilan ishlaydi: element `opacity: 0` da
 * turadi va faqat `data-revealed` qo'yilganda ochiladi. Bu esa
 * xavfli kelishuv — agar kuzatuvchi biror sababga ko'ra ishlamasa
 * (JS xatosi, brauzer o'ziga xosligi, element hech qachon "kesishmasa"),
 * MATN BUTUNLAY KO'RINMAY QOLADI. Foydalanuvchi bo'sh sahifani
 * ko'radi va nima bo'lganini bilmaydi.
 *
 * Shuning uchun bir martalik qo'riqchi: sahifa yuklangach 2.5 soniya
 * o'tib, EKRAN ICHIDA turgan, lekin hali ochilmagan har bir element
 * majburan ochiladi. Normal holatda u hech narsa qilmaydi — kuzatuvchi
 * elementlarni bir kadrda ochib bo'lgan bo'ladi. Ekrandan pastdagi
 * bloklar esa o'z navbatini kutaveradi, ya'ni scroll animatsiyasi
 * saqlanadi.
 */
let watchdog: ReturnType<typeof setTimeout> | null = null;

function startWatchdog() {
  if (watchdog !== null) return;
  watchdog = setTimeout(() => {
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-revealed]), [data-reveal-group]:not([data-revealed])",
    )) {
      const r = el.getBoundingClientRect();
      const visible = r.top < window.innerHeight && r.bottom > 0 && r.height > 0;
      if (visible) el.setAttribute("data-revealed", "");
    }
  }, 2500);
}

export function useRevealObserver(ref: RefObject<HTMLElement | null>, stagger: number | false) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Harakat o'chirilgan bo'lsa (JS yo'q, reduced-motion) — CSS allaqachon
    // kontentni ko'rsatib turibdi, kuzatishning hojati yo'q.
    if (document.documentElement.dataset.motion !== "on") return;

    if (stagger !== false) {
      const step = typeof stagger === "number" ? stagger : 0.14;
      // Kechikish inline `transition-delay` emas, CSS o'zgaruvchisi orqali
      // beriladi — shunda u faqat ochilishda qo'llanadi, yopilishda emas.
      Array.from(el.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty("--reveal-delay", `${i * step}s`);
      });
    }

    const reveal = getRevealObserver();
    const reset = getResetObserver();
    reveal.observe(el);
    reset.observe(el);
    startWatchdog();

    return () => {
      reveal.unobserve(el);
      reset.unobserve(el);
    };
  }, [ref, stagger]);
}
