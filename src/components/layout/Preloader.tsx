"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";

/** §4 — qattiq limit: nima bo'lishidan qat'i nazar shu vaqtda chiqadi. */
const MAX_WAIT_MS = 1200;
const SESSION_KEY = "ispace-preloaded";

/**
 * Yuklash pardasi (§4).
 *
 * LCP'ni bloklamaslik uchun kelishuvlar:
 *  · **hamma rasm kutilmaydi** — faqat shriftlar va birinchi hero rasmi;
 *  · 1200 ms dan keyin baribir ketadi (`Promise.race`);
 *  · sessiyada bir marta (`sessionStorage`);
 *  · `prefers-reduced-motion` da umuman ko'rsatilmaydi.
 *
 * Ko'rsatish/ko'rsatmaslik qarori bo'yashdan oldin, layout'dagi inline
 * skriptda `html[data-preloader]` orqali qabul qilinadi — shuning uchun
 * na miltillash, na hydration mismatch bo'ladi.
 */
export function Preloader() {
  const t = useTranslations("preloader");
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  const waitForCriticalAssets = useCallback(async () => {
    const hero = document.querySelector<HTMLImageElement>("[data-hero-lcp]");

    const assets = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      hero?.complete ? hero.decode().catch(() => undefined) : Promise.resolve(),
    ]);

    await Promise.race([
      assets,
      new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS)),
    ]);
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (document.documentElement.dataset.preloader === "skip") {
        setDone(true);
        return;
      }

      const tl = gsap.timeline();

      // Progress — haqiqiy yuklanishga bog'lanmagan, ammo uning davomiyligi
      // aynan MAX_WAIT bilan bir xil, ya'ni chiziq hech qachon "yolg'on
      // to'lib" kutib turmaydi.
      tl.to(barRef.current, {
        scaleX: 1,
        duration: MAX_WAIT_MS / 1000,
        ease: "power1.inOut",
      });

      void waitForCriticalAssets().then(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // Private rejimda sessionStorage yozilmasligi mumkin — muhim emas.
        }

        gsap
          .timeline({ onComplete: () => setDone(true) })
          // Progress qolgan qismini tez yakunlaydi, keyin parda ko'tariladi.
          .to(barRef.current, { scaleX: 1, duration: 0.25, ease: "power2.out" })
          .to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "+=0.05");
      });
    },
    { scope: ref },
  );

  if (done) return null;

  return (
    <div
      ref={ref}
      className="preloader fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-cream"
      role="status"
      aria-live="polite"
      aria-label={t("label")}
    >
      <span className="font-display text-[clamp(2rem,6vw,3.25rem)] tracking-[0.06em] text-espresso">
        i<span className="text-gold-deep">Space</span>
      </span>
      <span className="block h-px w-40 overflow-hidden bg-taupe/35" aria-hidden="true">
        <span
          ref={barRef}
          className="block h-full w-full origin-left scale-x-0 bg-gold"
        />
      </span>
    </div>
  );
}
