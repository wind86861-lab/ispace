"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaTier";

type LenisApi = {
  /** Elementga yoki ofsetga silliq siljish. */
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  /** Drawer/modal ochilganda sahifa scroll'ini to'xtatish. */
  setStopped: (stopped: boolean) => void;
};

/** Sticky header balandligi — anchor'ga siljiganda hisobga olinadi. */
const HEADER_OFFSET = -88;

/**
 * Lenis hali tayyor emas (yoki §14 bo'yicha o'chirilgan) paytdagi zaxira:
 * brauzerning o'z scroll'i. Shu sababli `useLenis()` hech qachon
 * xato tashlamaydi va chaqiruvchi komponent "tayyormi?" deb tekshirmaydi.
 */
const nativeApi: LenisApi = {
  scrollTo: (target, offset = HEADER_OFFSET) => {
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
  },
  setStopped: (stopped) => {
    document.documentElement.style.overflow = stopped ? "hidden" : "";
  },
};

const LenisContext = createContext<LenisApi>(nativeApi);

export const useLenis = () => useContext(LenisContext);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  /**
   * API obyektining identifikatori **o'zgarmaydi**: metodlar Lenis nusxasini
   * ref'dan o'qiydi. Shu sababli provider effekt ichida `setState` qilmaydi
   * (kaskadli renderlar yo'q) va iste'molchilarning `useEffect` bog'liqliklari
   * bejiz qayta ishga tushmaydi.
   */
  const api = useMemo<LenisApi>(
    () => ({
      scrollTo: (target, offset = HEADER_OFFSET) => {
        const lenis = lenisRef.current;
        if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
        else nativeApi.scrollTo(target, offset);
      },
      setStopped: (stopped) => {
        const lenis = lenisRef.current;
        if (lenis) {
          if (stopped) lenis.stop();
          else lenis.start();
        } else {
          nativeApi.setStopped(stopped);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    // §14 — harakat kamaytirilgan bo'lsa Lenis umuman ishga tushmaydi;
    // `api` avtomatik ravishda native scroll'ga tushadi.
    if (reduced) {
      document.documentElement.dataset.motion = "off";
      return;
    }

    document.documentElement.dataset.motion = "on";

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Touch'da native scroll qoladi: mobil brauzerlarda momentum'ni
      // dublikat qilish "yopishqoq" his beradi.
      syncTouch: false,
    });
    lenisRef.current = lenis;

    /* -------------------------------------------------------------------
       §1 — Lenis ↔ ScrollTrigger to'g'ri ulanishi.

       `ScrollTrigger.scrollerProxy` ATAYLAB ishlatilmaydi: u maxsus
       scroll-konteyner (Locomotive uslubi) uchun mo'ljallangan va Lenis
       oyna scroll'ida ishlaganda aynan pin/scrub siljishini keltirib
       chiqaradi. Lenis `window` ni boshqargani uchun kerak bo'lgani —
       ScrollTrigger'ni har scroll'da yangilash va Lenis'ni GSAP soatidan
       haydash, shunda ikkala tizim bitta kadr ritmida ishlaydi.
       ------------------------------------------------------------------- */
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return <LenisContext.Provider value={api}>{children}</LenisContext.Provider>;
}
