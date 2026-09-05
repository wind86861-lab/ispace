import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "uz", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
  // Har til o'z prefiksida: /ru, /uz, /en — hreflang va SEO uchun aniq.
  localePrefix: "always",
});

/** `<html lang>` va `Intl.*` uchun to'liq BCP-47 teglari. */
export const htmlLang: Record<Locale, string> = {
  ru: "ru-UZ",
  uz: "uz-UZ",
  en: "en-US",
};
