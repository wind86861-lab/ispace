import type { TimelinePoint } from "./types";

/**
 * Kompaniya tarixi — `/about` sahifasidagi gorizontal chiziq.
 *
 * Rasmlar ATAYLAB bo'sh: admin «Tarix» bo'limida yuklaguncha nuqta
 * faqat matn bilan chiziladi. Bo'sh o'rindosh gradient ko'rsatishdan
 * ko'ra matnning o'zi kengaygani yaxshiroq.
 */
export const timeline: TimelinePoint[] = [
  {
    _id: "tl-2007",
    year: 2007,
    title: { ru: "Начало", uz: "Boshlanish" },
    text: {
      ru: "Первый шаг: небольшая команда и одна цель — сделать заботу о теле доступной дома.",
      uz: "Birinchi qadam: kichik jamoa va bitta maqsad — tana haqidagi g‘amxo‘rlikni uyga olib kirish.",
    },
    image: { src: "", alt: { ru: "2007", uz: "2007" } },
  },
  {
    _id: "tl-2012",
    year: 2012,
    title: { ru: "Первый шоурум", uz: "Birinchi shourum" },
    text: {
      ru: "Кресла перестали быть картинкой в каталоге: их стало можно попробовать вживую.",
      uz: "Kreslolar katalogdagi rasm bo‘lishdan to‘xtadi — ularni jonli sinab ko‘rish mumkin bo‘ldi.",
    },
    image: { src: "", alt: { ru: "2012", uz: "2012" } },
  },
  {
    _id: "tl-2018",
    year: 2018,
    title: { ru: "Своя сервисная служба", uz: "O‘z servis xizmati" },
    text: {
      ru: "Гарантия перестала быть бумагой: ремонт и обслуживание — своими руками, без посредников.",
      uz: "Kafolat qog‘oz bo‘lishdan to‘xtadi: ta’mir va xizmat ko‘rsatish o‘z qo‘limizda, vositachisiz.",
    },
    image: { src: "", alt: { ru: "2018", uz: "2018" } },
  },
  {
    _id: "tl-2026",
    year: 2026,
    title: { ru: "Шесть шоурумов", uz: "Oltita shourum" },
    text: {
      ru: "Массажные и офисные кресла, фитнес и вендинг — в одном пространстве iSpace.",
      uz: "Massaj va ofis kreslolari, fitnes va vending — yagona iSpace maydonida.",
    },
    image: { src: "", alt: { ru: "2026", uz: "2026" } },
  },
];
