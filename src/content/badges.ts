import type { Badge } from "./types";

/**
 * Mahsulot nishonlari — dastlabki ro'yxat.
 *
 * Ikonlar hali yuklanmagan: `image.src` bo'sh, ya'ni nishon kartada
 * ko'rsatilmaydi. Admin «Belgilar» bo'limida ikon yuklagach paydo
 * bo'ladi. Shu sabab sayt hech qachon bo'sh ramka bilan chiqmaydi.
 */
export const badges: Badge[] = [
  {
    _id: "bg-4d",
    rank: 1,
    label: { ru: "4D", uz: "4D", en: "4D" },
    sublabel: { ru: "массаж", uz: "massaj", en: "massage" },
    image: { src: "", alt: { ru: "4D-массаж", uz: "4D massaj", en: "4D massage" } },
  },
  {
    _id: "bg-zero",
    rank: 2,
    label: { ru: "ZERO", uz: "ZERO", en: "ZERO" },
    sublabel: { ru: "gravity", uz: "gravity", en: "gravity" },
    image: { src: "", alt: { ru: "Невесомость", uz: "Vaznsizlik", en: "Zero gravity" } },
  },
  {
    _id: "bg-sl",
    rank: 3,
    label: { ru: "SL", uz: "SL", en: "SL" },
    sublabel: { ru: "каретка", uz: "karetka", en: "track" },
    image: { src: "", alt: { ru: "SL-каретка", uz: "SL-karetka", en: "SL-track" } },
  },
  {
    _id: "bg-heat",
    rank: 4,
    label: { ru: "", uz: "", en: "" },
    sublabel: { ru: "подогрев", uz: "isitish", en: "heating" },
    image: { src: "", alt: { ru: "Подогрев", uz: "Isitish", en: "Heating" } },
  },
];
