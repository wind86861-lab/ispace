import type { TrustPoint } from "./types";

/**
 * Lead bandi ostidagi ishonch chizig'i.
 *
 * Ilgari bu matnlar `messages/*.json` da, `lead.trust.*` kalitlari
 * ostida edi — ya'ni ularni o'zgartirish uchun dasturchi kerak edi.
 * Endi ular kontent kolleksiyasi: admin «Ishonch chizig'i» bo'limida
 * tahrirlaydi, qo'shadi va o'chiradi.
 */
export const leadTrust: TrustPoint[] = [
  {
    _id: "tp-warranty",
    rank: 1,
    icon: "shield",
    title: { ru: "Официальная гарантия", uz: "Rasmiy kafolat", en: "Official warranty" },
    text: { ru: "От 1 до 5 лет", uz: "1 yildan 5 yilgacha", en: "1 to 5 years" },
  },
  {
    _id: "tp-delivery",
    rank: 2,
    icon: "truck",
    title: {
      ru: "Доставка по Узбекистану",
      uz: "O‘zbekiston bo‘ylab yetkazib berish",
      en: "Delivery across Uzbekistan",
    },
    text: { ru: "Быстро и надёжно", uz: "Tez va ishonchli", en: "Fast and reliable" },
  },
  {
    _id: "tp-support",
    rank: 3,
    icon: "headset",
    title: { ru: "Поддержка 24/7", uz: "24/7 qo‘llab-quvvatlash", en: "24/7 support" },
    text: { ru: "Всегда на связи", uz: "Doim aloqadamiz", en: "Always in touch" },
  },
];
