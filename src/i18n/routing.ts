import { defineRouting } from "next-intl/routing";

/*
 * Ingliz versiyasi OLIB TASHLANDI: sayt O'zbekiston bozori uchun va
 * mijozlar ruscha yoki o'zbekcha o'qiydi. Uchinchi til har kontent
 * yozuvida uchinchi maydonni to'ldirishni talab qilardi, amalda esa
 * hech kim uni to'ldirmasdi.
 */
export const locales = ["ru", "uz"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
  // Har til o'z prefiksida: /ru, /uz — hreflang va SEO uchun aniq.
  localePrefix: "always",
});

/** `<html lang>` va `Intl.*` uchun to'liq BCP-47 teglari. */
export const htmlLang: Record<Locale, string> = {
  ru: "ru-UZ",
  uz: "uz-UZ",
};
