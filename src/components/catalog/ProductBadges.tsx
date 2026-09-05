"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Badge } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { useMediaTier } from "@/hooks/useMediaTier";
import { MAX_BADGES } from "@/lib/limits";

/**
 * Mahsulot nishonlari — kartadagi rasm ustida, chap chekkada ustun.
 *
 * YAGONA manba — «Belgilar» bo'limi: admin u yerda rasm yuklaydi va
 * nom beradi, mahsulot muharririda esa kerakligini belgilaydi.
 *
 * Ilgari bu yerda ikkinchi manba ham bor edi (mahsulotning kod ichidagi
 * `features` ikonlari). U chalkashlik tug'dirardi: bir xil ko'rinadigan
 * ikki narsa ikki xil joyda sozlanardi va qaysi biri kartada
 * chiqishini oldindan aytib bo'lmasdi. Endi bitta yo'l qoldi.
 *
 * Nishon rasmi — BUTUN plitka: o'z foni, o'z yozuvi va o'z sirti bilan
 * («DUAL TRACK» kabi metall plitka). Shu sabab uning ostiga hech narsa
 * qo'shilmaydi va u oq ramkaga ham solinmaydi — aks holda ikki fon
 * ustma-ust tushardi. Nom `aria-label` va `title` da qoladi: ekran
 * o'quvchi o'qiydi, sichqoncha ushlab turilganda ko'rinadi.
 *
 * Ko'pi bilan to'rtta: kartaning rasm balandligi cheklangan va
 * beshinchisi pastdagi narx bloki ustiga chiqib ketardi.
 *
 * HARAKAT: karta ko'rish maydoniga kirganda plitkalar birin-ketin
 * chapdan chiqadi va har biri bir marta yengil "nafas oladi" —
 * kattalashib, o'z o'lchamiga qaytadi. Ustun shu bilan e'tiborni
 * o'ziga tortadi, lekin tinch qoladi: pulsatsiya takrorlanmaydi,
 * faqat kartaga qaytib kelinganda qayta o'ynaydi.
 */

export function ProductBadges({
  badges,
  locale,
  belowRibbon = false,
  className = "",
}: {
  badges: Badge[];
  locale: Locale;
  /**
   * `true` — kartada «NEW» lentasi bor va u AYNAN shu burchakda turadi;
   * ustun uning ostidan boshlanadi. Buni `className` bilan berish
   * ishlamaydi: `top-3` ham, `top-12` ham bir xil xususiylikda va
   * qaysi biri yutishi CSS tartibiga qolib ketardi.
   */
  belowRibbon?: boolean;
  className?: string;
}) {
  const { reduced } = useMediaTier();

  /*
   * Ikoni YUKLANMAGAN nishon chizilmaydi: admin belgini yaratib
   * qo'yishi mumkin, lekin u kartada faqat rasm kelgach paydo bo'ladi —
   * bo'sh ramka hech qachon ko'rinmaydi.
   */
  const shown = badges
    .filter((b) => b.image.uploaded === true)
    .slice(0, MAX_BADGES);

  if (shown.length === 0) return null;

  return (
    <motion.ul
      /*
       * Ketma-ketlikni ONA element boshqaradi (`staggerChildren`) —
       * har bolaga qo'lda `delay` yozish o'rniga. Shunda plitkalar
       * soni o'zgarsa ham ritm o'z-o'zidan to'g'ri qoladi.
       */
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "shown"}
      viewport={VIEWPORT}
      variants={LIST}
      className={[
        "pointer-events-none absolute left-3 z-[2] flex flex-col gap-1.5",
        belowRibbon ? "top-12" : "top-3",
        className,
      ].join(" ")}
    >
      {shown.map((b) => {
        const label = [
          pick(b.label, locale),
          b.sublabel ? pick(b.sublabel, locale) : "",
        ]
          .map((v) => v.trim())
          .filter(Boolean)
          .join(" ");
        return (
          <motion.li
            key={b._id}
            variants={TILE}
            title={label || undefined}
            className="relative block size-14"
          >
            <Image
              src={b.image.src}
              alt={label || pick(b.image.alt, locale)}
              fill
              sizes="56px"
              className="object-contain"
            />
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/**
 * Har qaytib kelinganda o'ynaydi (`once: false`) — saytdagi qolgan
 * kirish animatsiyalari ham shunday ishlaydi (`useRevealObserver`).
 * `amount: 0.5` — karta yarmidan ko'pi ko'ringandagina, aks holda
 * ekran chekkasida turgan kartalar bekorga "yonib" ketardi.
 */
const VIEWPORT = { once: false, amount: 0.5 } as const;

const LIST = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};

/**
 * Bitta plitkaning yo'li: chapdan chiqadi, so'ng kattalashib o'z
 * o'lchamiga qaytadi. `scale` uch kalit kadrda — shuning uchun u
 * `keyframes` sifatida beriladi va vaqt taqsimoti `times` bilan
 * boshqariladi: ko'tarilish tez, qaytish sekinroq.
 */
const TILE = {
  hidden: { opacity: 0, x: -12, scale: 0.9 },
  shown: {
    opacity: 1,
    x: 0,
    scale: [0.9, 1.18, 1],
    transition: {
      duration: 0.62,
      times: [0, 0.45, 1],
      ease: [0.2, 0.7, 0.3, 1] as [number, number, number, number],
    },
  },
};
