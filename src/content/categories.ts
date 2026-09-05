import type { Category } from "./types";

export const categories: Category[] = [
  {
    _id: "cat-massage-chairs",
    slug: "massage-chairs",
    featured: true,
    title: { ru: "Массажные кресла", uz: "Massaj kreslolari", en: "Massage chairs" },
    text: {
      ru: "Профессиональный массаж и рефлексотерапия в домашних условиях",
      uz: "Uy sharoitida professional massaj va refleksoterapiya",
      en: "Professional massage and reflexology at home",
    },
    image: {
      src: "/images/categories/massage-chairs.webp",
      alt: { ru: "Массажное кресло", uz: "Massaj kreslosi", en: "Massage chair" },
      width: 1200, height: 1400,
    },
  },
  {
    _id: "cat-office-chairs",
    slug: "office-chairs",
    title: { ru: "Офисные кресла", uz: "Ofis kreslolari", en: "Office chairs" },
    image: {
      src: "/images/categories/office-chairs.webp",
      alt: { ru: "Эргономичное офисное кресло", uz: "Ergonomik ofis kreslosi", en: "Ergonomic office chair" },
      width: 900, height: 700,
    },
  },
  {
    _id: "cat-treadmills",
    slug: "treadmills",
    title: { ru: "Беговые дорожки", uz: "Yugurish yo‘lakchalari", en: "Treadmills" },
    image: {
      src: "/images/categories/treadmills.webp",
      alt: { ru: "Беговая дорожка", uz: "Yugurish yo‘lakchasi", en: "Treadmill" },
      width: 900, height: 700,
    },
  },
  {
    _id: "cat-exercise-bikes",
    slug: "exercise-bikes",
    title: { ru: "Велотренажёры", uz: "Velotrenajyorlar", en: "Exercise bikes" },
    image: {
      src: "/images/categories/exercise-bikes.webp",
      alt: { ru: "Велотренажёр", uz: "Velotrenajyor", en: "Exercise bike" },
      width: 900, height: 700,
    },
  },
  {
    _id: "cat-ellipticals",
    slug: "ellipticals",
    title: { ru: "Эллиптические тренажёры", uz: "Elliptik trenajyorlar", en: "Elliptical trainers" },
    image: {
      src: "/images/categories/ellipticals.webp",
      alt: { ru: "Эллиптический тренажёр", uz: "Elliptik trenajyor", en: "Elliptical trainer" },
      width: 900, height: 700,
    },
  },
  {
    _id: "cat-vending",
    slug: "vending",
    // Pastda butun qatorni egallaydigan uzun karta.
    wide: true,
    title: { ru: "Вендинговые автоматы", uz: "Vending avtomatlari", en: "Vending machines" },
    text: {
      ru: "Массажные кресла и автоматы для торговых центров, отелей и офисов",
      uz: "Savdo markazlari, mehmonxona va ofislar uchun massaj kreslolari va avtomatlar",
      en: "Massage chairs and machines for malls, hotels and offices",
    },
    image: {
      src: "/images/categories/vending.webp",
      alt: { ru: "Вендинговый автомат iSpace", uz: "iSpace vending avtomati", en: "iSpace vending machine" },
      width: 1600, height: 600,
    },
  },
];
