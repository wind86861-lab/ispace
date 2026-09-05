import type { Locale } from "@/i18n/routing";
import { htmlLang } from "@/i18n/routing";

/**
 * Valyuta yorlig'i tilga bog'liq (§8).
 *
 * `Intl` ning `currency: "UZS"` rejimi tekshirildi:
 *   uz-UZ → "1 690 000 soʻm"  ✅ tabiiy
 *   en-US → "UZS 1,690,000"   ✅ tabiiy
 *   ru-UZ → "1 690 000 UZS"   ❌ ruscha saytda "сум" bo'lishi kerak
 * Shuning uchun faqat ru qo'lda yoziladi, qolgani `Intl` ga qoldiriladi.
 */
const RU_CURRENCY_SUFFIX = "сум";

export function formatPrice(value: number, locale: Locale): string {
  if (locale === "ru") {
    const number = new Intl.NumberFormat(htmlLang.ru, {
      maximumFractionDigits: 0,
    }).format(value);
    return `${number} ${RU_CURRENCY_SUFFIX}`;
  }

  return new Intl.NumberFormat(htmlLang[locale], {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Oyi so'z bilan. ru da `Intl` "15 марта 2026 г." beradi — dizaynda
 * oxirgi "г." yo'q, shuning uchun kesiladi.
 */
export function formatDate(iso: string, locale: Locale): string {
  const formatted = new Intl.DateTimeFormat(htmlLang[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

  return locale === "ru" ? formatted.replace(/\s*г\.$/, "") : formatted;
}

/** Counter uchun: `50000` → `50 000`. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(htmlLang[locale], {
    maximumFractionDigits: 0,
  }).format(value);
}
