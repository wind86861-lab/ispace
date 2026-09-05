"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Advantage } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { DrawIcon } from "@/components/ui/DrawIcon";

/**
 * Yagona to'q fonli bo'lim — krem monotonligini uzib, sahifaga "og'irlik"
 * qo'shadi. Imzo harakati: oltin ikonlar scroll'da DrawSVG bilan
 * chizilib chiqadi (§6).
 */
export function Advantages({ advantages }: { advantages: Advantage[] }) {
  const t = useTranslations("advantages");
  const locale = useLocale() as Locale;

  return (
    /*
      To'q bo'lim endi tekis emas: charcoal fonda ikkita iliq nur
      (oltin va rosewood) turadi — bo'lim "yassi" ko'rinmaydi va
      palitraga ikkinchi urg'u rangi kiradi.
    */
    <section className="relative overflow-hidden bg-charcoal py-20 text-cream sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-gold/12 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-48 h-[28rem] w-[28rem] rounded-full bg-rosewood/25 blur-[130px]"
      />

      <div className="relative container-lux">
        <SectionHeading
          tone="dark"
          // To'q fonda oltin yorug'lik eng aniq ko'rinadi — saytda
          // yagona joy, shuning uchun u "imzo" bo'lib qoladi.
          sweep
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-cream/10 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item, i) => (
            <li key={item._id} className="group/col relative bg-charcoal transition-colors duration-500 hover:bg-espresso">
              <Reveal
                as="article"
                // Ustun ichida ham ritm: ikon → sarlavha → matn ketma-ket.
                stagger={0.09}
                delay={i * 0.1}
                className="h-full p-7"
              >
                {/* Tartib raqami — ustunlarga ritm beradi va bo'sh
                    yuqori maydonni to'ldiradi. */}
                <span
                  aria-hidden="true"
                  className="mb-5 block font-display text-[14px] tracking-[0.2em] text-rosewood-soft transition-colors duration-500 group-hover/col:text-gold"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <DrawIcon
                  name={item.icon}
                  size={30}
                  delay={0.15 + i * 0.12}
                  className="mb-6 inline-block text-gold transition-transform duration-500 group-hover/col:-translate-y-1"
                />

                <h3 className="font-display text-lg leading-snug text-cream">
                  {pick(item.title, locale)}
                </h3>

                <p className="mt-3 text-[14px] leading-relaxed text-cream/60">
                  {pick(item.text, locale)}
                </p>

                {/* Hover'da pastdan nozik oltin chiziq chiziladi. */}
                {/* Hover'da pastdan chiziq chiziladi — oltindan rosewood'ga
                    o'tuvchi gradient bilan. */}
                <span
                  aria-hidden="true"
                  className="mt-6 block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-light to-rosewood-soft transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover/col:scale-x-100"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
