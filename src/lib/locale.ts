import type { Locale } from "@/i18n/routing";
import type { LocaleString } from "@/content/types";

/**
 * Lokalizatsiyalangan maydondan joriy tildagi qiymatni oladi.
 * Sanity'dagi `localeString` bilan bir xil semantika: tarjima bo'lmasa
 * ru (defaultLocale) ga tushadi — bo'sh joy qolmaydi.
 */
export function t(field: LocaleString | undefined, locale: Locale): string {
  if (!field) return "";
  return field[locale] || field.ru || "";
}
