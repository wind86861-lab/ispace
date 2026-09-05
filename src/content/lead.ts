import type { Lead } from "./types";

export const lead: Lead = {
  /*
   * Fon rasmi bandda MIXLANIB turadi (`LeadForm` → `bg-pinned-*`): u
   * bandning emas, EKRANNING o'lchamida chiziladi. Shuning uchun
   * o'lcham ham ekranga qarab tanlangan — ilgari bu yerda 900×700
   * turardi va rasm keng monitorda cho'zilib, donadorlashib qolardi.
   */
  image: {
    src: "/images/lead/lead-chair.webp",
    width: 2400,
    height: 1600,
    alt: {
      ru: "Массажное кресло iSpace",
      uz: "iSpace massaj kreslosi",
      en: "iSpace massage chair",
    },
  },
};
