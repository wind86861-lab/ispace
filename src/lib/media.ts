import type { CSSProperties } from "react";
import type { Media } from "@/content/types";

/**
 * `next/image` sifati.
 *
 * Next 16 da `images.qualities` sukut bo'yicha `[75]`, ya'ni BARCHA
 * rasm 75 da beriladi va boshqa qiymat eng yaqiniga "yaxlitlanadi".
 * Premium mahsulot fotosida bu ko'zga tashlanadi: teri fakturasi va
 * chok chiziqlari yuviladi.
 *
 * 90 — sezilarli tiniqlik beradi, 95+ esa hajmni oshirib, ko'zga
 * deyarli hech narsa qo'shmaydi. Qiymat `next.config.ts` dagi
 * ro'yxatga ham kiritilgan, aks holda u 75 ga tushib qolardi.
 */
export const IMAGE_QUALITY = 90;

/**
 * Rasm maydonga qanday joylashishini hal qiladi.
 *
 * `contain` rejimida rasm kesilmaydi va bo'sh qolgan chekkalar rasmning
 * o'z fon rangi bilan to'ldiriladi — shuning uchun oq fonli mahsulot
 * fotosi maydonda yaxlit ko'rinadi, "letterbox" qora chiziq chiqmaydi.
 */
export function mediaFit(media: Pick<Media, "fit" | "bg">): {
  className: string;
  style?: CSSProperties;
} {
  if (media.fit !== "contain") return { className: "object-cover" };
  return {
    className: "object-contain",
    style: media.bg ? { backgroundColor: media.bg } : undefined,
  };
}
