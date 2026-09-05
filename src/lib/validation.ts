import type { FieldValues, Path, RegisterOptions } from "react-hook-form";

/** Faqat raqamlarni qoldiradi — formatlash belgilariga bog'liq bo'lmaslik uchun. */
export const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Yuborishdan oldin bir xil ko'rinishga keltiradi: `+998901234567`. */
export function normalizePhone(value: string): string {
  const digits = digitsOnly(value);
  return `+${digits.length === 9 ? `998${digits}` : digits}`;
}

/**
 * Validatsiya qoidalari react-hook-form'ning o'zida yoziladi.
 *
 * Dastlab reja `zod` + `@hookform/resolvers` ni nazarda tutgandi, ammo
 * bundle o'lchovi ularni **95.7 KB gzip** deb ko'rsatdi — ikkita maydonli
 * ikkita forma uchun mutlaqo asossiz narx (§3 byudjeti). RHF'ning o'z
 * qoidalari aynan shu validatsiyani nol qo'shimcha bayt bilan beradi.
 * Forma murakkablashsa (ko'p qadamli, shartli maydonlar) schema kutubxonasi
 * qaytarilishi mumkin — o'shanda `zod/mini` ko'rib chiqilsin.
 */
export function requiredText<T extends FieldValues, N extends Path<T>>(
  message: string,
  min = 2,
): RegisterOptions<T, N> {
  return {
    required: message,
    minLength: { value: min, message },
    setValueAs: (v: string) => v.trim(),
  };
}

/**
 * O'zbekiston mobil raqami: 998 + 9 raqam.
 * `+998 90 123-45-67`, `998901234567` va `90 123 45 67` — hammasi qabul
 * qilinadi, chunki tekshiruvdan oldin belgilar tozalanadi.
 */
export function uzPhoneRules<T extends FieldValues, N extends Path<T>>(
  message: string,
): RegisterOptions<T, N> {
  return {
    required: message,
    validate: (value: string) => {
      const digits = digitsOnly(value ?? "");
      return /^998\d{9}$/.test(digits) || /^\d{9}$/.test(digits) || message;
    },
  };
}
