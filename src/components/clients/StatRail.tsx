"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import type { ClientService } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaTier } from "@/hooks/useMediaTier";
import { motionEnabled } from "@/lib/motion";
import { useLenis } from "@/components/providers/LenisProvider";
import { DigitRoll } from "./DigitRoll";

/**
 * Raqamlar chizig'i — sahifaning birinchi va’dasi.
 *
 * Foydalanuvchi bir qarashda to'rt shartni ko'radi: qancha turadi,
 * qancha bo'lib to'lanadi, qancha kafolat, qancha kun. Matnni o'qish
 * shart emas — shu sabab u sarlavhadan darrov keyin turadi.
 *
 * Har katak o'z bo'limiga havola: bosilganda sahifa o'sha yerga
 * silliq tushadi. Ya'ni chiziq ayni paytda navigatsiya ham.
 */
export function StatRail({ services }: { services: ClientService[] }) {
  const locale = useLocale() as Locale;
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = useMediaTier();

  const items = services.filter((s) => s.stat);

  useGSAP(
    () => {
      if (reduced || !motionEnabled() || !root.current) return;

      /*
        Kataklar orasidagi CHIZIQ scroll bilan chizib chiqiladi.

        Nega bu harakat kerak: chiziq to'rt raqamni bitta va’daga
        bog'laydi. U o'zidan paydo bo'lsa — bezak; scroll bilan
        chizilsa — foydalanuvchi harakatining natijasi.
      */
      const line = root.current.querySelector<HTMLElement>("[data-line]");
      if (!line) return;

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top 88%",
        end: "bottom 70%",
        scrub: 0.6,
        onUpdate: (self) => {
          line.style.transform = `scaleX(${self.progress})`;
        },
      });
      return () => st.kill();
    },
    { scope: root, dependencies: [reduced] },
  );

  if (items.length === 0) return null;

  return (
    <div ref={root} className="relative mt-14 lg:mt-16">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-taupe/35"
      />
      <span
        data-line
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-deep to-gold shadow-[0_0_12px_-2px_var(--color-gold-deep)]"
      />

      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 pt-8 lg:grid-cols-4">
        {items.map((s, i) => (
          <li key={s._id}>
            <button
              type="button"
              onClick={() => lenis.scrollTo(`#${s.slug}`)}
              className="group block w-full text-start"
            >
              <span className="flex items-baseline gap-1.5">
                <DigitRoll
                  value={s.stat!.value}
                  delay={i * 0.08}
                  className="font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-none text-espresso transition-colors duration-500 group-hover:text-gold-deep"
                />
                {s.stat!.unit && (
                  <span className="text-[13px] text-espresso-soft/85">
                    {pick(s.stat!.unit, locale)}
                  </span>
                )}
              </span>

              <span className="mt-2.5 block max-w-[22ch] text-[13px] leading-snug text-espresso-soft">
                {pick(s.stat!.label, locale)}
              </span>

              {/*
                Ostidagi chiziq hoverda CHAPDAN o'ngga ochiladi —
                yo'nalish o'qish yo'nalishi bilan bir xil, ya'ni
                harakat matnni "kuzatib" boradi.
              */}
              <span
                aria-hidden="true"
                className="mt-3 block h-px w-full origin-left scale-x-0 bg-gold-deep transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-x-100"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
