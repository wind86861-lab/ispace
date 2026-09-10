"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Branch } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { DUR, EASE_LUX } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { BranchGallery } from "./BranchGallery";

/**
 * Tanlangan filial: nomi, kontaktlari, fotosi va joylashuvi.
 *
 * Ro'yxat shu yerda — sahifada tanlov BITTA joyda saqlanishi kerak.
 * Bosh sahifadagi `Branches` bo'limi o'z tanloviga ega; ikkalasini bir
 * sahifaga qo'ysak, foydalanuvchi bir joyda tanlab, ikkinchisi
 * o'zgarmay qolgani sabab chalkashardi.
 *
 * Xarita `iframe` — `loading="lazy"` bilan: u sahifaning eng pastida
 * turadi va darrov kerak emas.
 */
export function BranchDetail({ branches }: { branches: Branch[] }) {
  const t = useTranslations("branchesPage");
  const tb = useTranslations("branches");
  const locale = useLocale() as Locale;

  const [activeId, setActiveId] = useState(branches[0]._id);
  const active = branches.find((b) => b._id === activeId) ?? branches[0];
  /*
   * Fotolar: eski bitta rasmli maydon BIRINCHI, keyin yangilari.
   * Faqat haqiqatan yuklangani — bo'sh o'rindosh ramka chizilmaydi.
   */
  const photos = [active.photo, ...(active.photos ?? [])].filter(
    (m): m is NonNullable<typeof m> => m?.uploaded === true,
  );

  return (
    <>
      <Reveal>
        <p className="text-[12px] tracking-[0.12em] text-espresso-soft/85 uppercase">
          {t("chooseCity")}
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="mt-4 flex flex-wrap gap-2">
          {branches.map((b) => {
            const on = b._id === activeId;
            return (
              <li key={b._id}>
                <button
                  type="button"
                  onClick={() => setActiveId(b._id)}
                  aria-pressed={on}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px]",
                    "transition-colors duration-300",
                    on
                      ? "border-gold/60 bg-gold/12 text-gold-ink"
                      : "border-taupe/40 bg-warm-white text-espresso-soft hover:border-gold/50 hover:text-espresso",
                  ].join(" ")}
                >
                  <MapPin size={14} strokeWidth={1.6} aria-hidden="true" />
                  {pick(b.city, locale)} — {pick(b.district, locale)}
                </button>
              </li>
            );
          })}
        </ul>
      </Reveal>

      {/*
        Ma'lumot va xarita BIR TOMONDA, fotolar ikkinchi tomonda.

        Ilgari xarita butun kenglikda, ma'lumotning ostida turardi:
        filial manzilini o'qib, uni xaritada topish uchun ko'z ekran
        bo'ylab pastga tushishi kerak edi. Endi ular yonma-yon —
        manzil va uning joyi bir qarashda.

        Fotosi YO'Q filialda ham ikki ustun saqlanadi: o'ngga xarita
        ko'chadi. Ilgari bunday holatda ustun yopilib, blok butun
        kenglikda cho'zilgan ustunga aylanardi — sahifa avvalgidek
        ko'rinardi. Bo'sh o'rindosh ramka esa baribir chizilmaydi.
      */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_minmax(0,42%)] lg:gap-6">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: DUR.micro, ease: EASE_LUX }}
              className="rounded-2xl border border-taupe/30 bg-warm-white p-6 sm:p-7"
            >
              <h2 className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] text-espresso">
                {pick(active.city, locale)} — {pick(active.district, locale)}
              </h2>

              <p className="mt-2 text-[14px] leading-relaxed text-espresso-soft">
                {pick(active.address, locale)}
              </p>

              <dl className="mt-5 space-y-3 text-[14px] text-espresso-soft">
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">{tb("phone")}</dt>
                  <Phone size={15} strokeWidth={1.5} aria-hidden="true" className="text-gold" />
                  <dd>
                    <a
                      href={`tel:${active.phone.replace(/\D/g, "")}`}
                      className="transition-colors duration-300 hover:text-gold-ink"
                    >
                      {active.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">{tb("hours")}</dt>
                  <Clock size={15} strokeWidth={1.5} aria-hidden="true" className="text-gold" />
                  <dd>{pick(active.hours, locale)}</dd>
                </div>
              </dl>

              <a
                href={active.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-gold-deep transition-colors duration-300 hover:text-espresso"
              >
                {t("route")}
                <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
              </a>
            </motion.div>
          </AnimatePresence>

          {/*
            Xarita fotolar BOR bo'lganda chap ustunda, ma'lumotning
            ostida turadi. Fotolar bo'lmasa u o'ng ustunga ko'chadi —
            shunda manzil va uning joyi yonma-yon qoladi.
          */}
          {photos.length > 0 && <MapFrame branch={active} locale={locale} title={t("onMap")} />}
        </div>

        <div className="min-w-0">
          {photos.length > 0 ? (
            <BranchGallery
              key={active._id}
              photos={photos}
              locale={locale}
              label={`${pick(active.city, locale)} — ${pick(active.district, locale)}`}
            />
          ) : (
            <MapFrame branch={active} locale={locale} title={t("onMap")} flush />
          )}
        </div>
      </div>

    </>
  );
}

/**
 * Google xaritasi ramkasi.
 *
 * Ikki joyda ishlatilgani uchun alohida: fotolar bor bo'lsa u chap
 * ustunda ma'lumot ostida, yo'q bo'lsa o'ng ustunda yolg'iz turadi.
 * `flush` — yuqori chekkasi ma'lumot kartasi bilan tekislanadi
 * (ustidagi bo'shliq kerak emas).
 *
 * `loading="lazy"` — xarita og'ir uchinchi tomon ramkasi; u ekranga
 * kirmaguncha so'ralmaydi.
 */
function MapFrame({
  branch,
  locale,
  title,
  flush = false,
}: {
  branch: Branch;
  locale: Locale;
  title: string;
  flush?: boolean;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-taupe/30 bg-cream",
        flush ? "h-full" : "mt-4",
      ].join(" ")}
    >
      <iframe
        key={branch._id}
        title={`${pick(branch.city, locale)} — ${title}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={[
          "block w-full border-0",
          flush ? "h-[20rem] sm:h-[24rem] lg:h-full lg:min-h-[26rem]" : "h-[20rem] sm:h-[24rem]",
        ].join(" ")}
        src={`https://maps.google.com/maps?q=${branch.geo.lat},${branch.geo.lng}&z=16&output=embed`}
      />
    </div>
  );
}
