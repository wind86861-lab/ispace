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
    stats: [
      { _id: "st-07-team", value: 4, label: { ru: "Инженеры в команде", uz: "Jamoadagi muhandis" } },
      { _id: "st-07-models", value: 3, label: { ru: "Модели в каталоге", uz: "Katalogdagi model" } },
    ],
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
    stats: [
      { _id: "st-12-showroom", value: 1, label: { ru: "Шоурум", uz: "Shourum" } },
      { _id: "st-12-clients", value: 2000, suffix: "+", label: { ru: "Довольных клиентов", uz: "Mamnun mijozlar" } },
      { _id: "st-12-models", value: 12, label: { ru: "Моделей", uz: "Model" } },
    ],
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
    stats: [
      { _id: "st-18-showroom", value: 3, label: { ru: "Шоурума", uz: "Shourum" } },
      { _id: "st-18-clients", value: 18000, suffix: "+", label: { ru: "Довольных клиентов", uz: "Mamnun mijozlar" } },
      { _id: "st-18-service", value: 1, label: { ru: "Сервисная служба", uz: "Servis xizmati" } },
    ],
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
    stats: [
      { _id: "st-26-year", value: 2007, label: { ru: "Год основания", uz: "Tashkil topgan yil" } },
      { _id: "st-26-clients", value: 50000, suffix: "+", label: { ru: "Довольных клиентов", uz: "Mamnun mijozlar" } },
      { _id: "st-26-years", value: 18, suffix: "+", label: { ru: "Лет на рынке", uz: "Yillik tajriba" } },
      { _id: "st-26-showroom", value: 6, label: { ru: "Шоурума", uz: "Shourum" } },
    ],
  },
];
