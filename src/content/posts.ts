import type { Post } from "./types";
import { postBodies } from "./post-bodies";

const list: Post[] = [
  {
    _id: "po-choose", slug: "how-to-choose-a-massage-chair",
    category: "reviews", publishedAt: "2026-05-15", readingMinutes: 7,
    title: {
      ru: "Как выбрать массажное кресло для дома: 7 важных критериев",
      uz: "Uy uchun massaj kreslosini qanday tanlash: 7 muhim mezon",
      en: "How to choose a massage chair for home: 7 criteria that matter",
    },
    excerpt: {
      ru: "Разбираемся, на что смотреть в первую очередь: тип направляющей, зона охвата, рост пользователя и реальный уровень шума.",
      uz: "Avvalo nimaga qarash kerakligini ko‘rib chiqamiz: yo‘naltirgich turi, qamrov zonasi, foydalanuvchi bo‘yi va haqiqiy shovqin darajasi.",
      en: "What to look at first: track type, coverage area, user height and the real noise level.",
    },
    cover: { src: "/images/blog/choose.webp", width: 800, height: 500,
      alt: { ru: "Выбор массажного кресла", uz: "Massaj kreslosini tanlash", en: "Choosing a massage chair" } },
  },
  {
    _id: "po-back", slug: "relieve-back-tension",
    category: "health", publishedAt: "2026-05-02", readingMinutes: 5,
    title: {
      ru: "Как снять напряжение со спины и улучшить сон",
      uz: "Beldagi taranglikni qanday yozish va uyquni yaxshilash",
      en: "How to release back tension and sleep better",
    },
    excerpt: {
      ru: "Короткая вечерняя программа на 15 минут, которая заметно снижает нагрузку после рабочего дня за компьютером.",
      uz: "Kompyuter oldidagi ish kunidan keyin yukni sezilarli kamaytiradigan 15 daqiqalik kechki dastur.",
      en: "A short 15-minute evening routine that noticeably eases the load after a desk-bound day.",
    },
    cover: { src: "/images/blog/back.webp", width: 800, height: 500,
      alt: { ru: "Расслабление спины", uz: "Belni bo‘shatish", en: "Relaxing the back" } },
  },
  {
    _id: "po-tech", slug: "technology-of-future-chairs",
    category: "massage", publishedAt: "2026-04-21", readingMinutes: 6,
    title: {
      ru: "Технологии будущего в массажных креслах iSpace",
      uz: "iSpace massaj kreslolarida kelajak texnologiyalari",
      en: "Tomorrow's technology inside iSpace chairs",
    },
    excerpt: {
      ru: "4D-механизм, сканирование позвоночника и адаптивные программы: что из этого действительно меняет ощущения.",
      uz: "4D mexanizm, umurtqa skaneri va moslashuvchan dasturlar: bulardan qaysi biri hissiyotni haqiqatan o‘zgartiradi.",
      en: "4D mechanisms, spinal scanning and adaptive programmes — which of them actually changes how it feels.",
    },
    cover: { src: "/images/blog/tech.webp", width: 800, height: 500,
      alt: { ru: "Технологии массажного кресла", uz: "Massaj kreslosi texnologiyalari", en: "Massage chair technology" } },
  },
  {
    _id: "po-care", slug: "leather-care",
    category: "tips", publishedAt: "2026-04-04", readingMinutes: 4,
    title: {
      ru: "6 советов, как ухаживать за обивкой кресла",
      uz: "Kreslo qoplamasini parvarishlash bo‘yicha 6 maslahat",
      en: "6 tips for looking after your chair's upholstery",
    },
    excerpt: {
      ru: "Простые правила, которые продлевают жизнь эко-коже и сохраняют кресло как новое годами.",
      uz: "Eko-teri umrini uzaytiradigan va kresloni yillar davomida yangidek saqlaydigan oddiy qoidalar.",
      en: "Simple habits that extend the life of eco-leather and keep a chair looking new for years.",
    },
    cover: { src: "/images/blog/care.webp", width: 800, height: 500,
      alt: { ru: "Уход за обивкой кресла", uz: "Kreslo qoplamasini parvarishlash", en: "Caring for chair upholstery" } },
  },
  {
    _id: "po-office", slug: "office-chairs-for-teams",
    category: "news", publishedAt: "2026-03-19", readingMinutes: 5,
    title: {
      ru: "Офисные кресла для команды: что учесть при закупке",
      uz: "Jamoa uchun ofis kreslolari: xarid qilishda nimaga e’tibor berish kerak",
      en: "Office chairs for a team: what to weigh before buying",
    },
    excerpt: {
      ru: "Регулировки, нагрузка, гарантия и сервис — на чём нельзя экономить при закупке на весь офис.",
      uz: "Sozlamalar, yuklama, kafolat va servis — butun ofis uchun xaridda nimadan tejash mumkin emas.",
      en: "Adjustability, load rating, warranty and service — where cutting costs will hurt you later.",
    },
    cover: { src: "/images/blog/office.webp", width: 800, height: 500,
      alt: { ru: "Офисные кресла", uz: "Ofis kreslolari", en: "Office chairs" } },
  },
  {
    _id: "po-showroom", slug: "new-showroom-bukhara",
    category: "news", publishedAt: "2026-02-27", readingMinutes: 3,
    title: {
      ru: "Новый шоурум iSpace открылся в Бухаре",
      uz: "Buxoroda yangi iSpace shourumi ochildi",
      en: "A new iSpace showroom has opened in Bukhara",
    },
    excerpt: {
      ru: "Шестая площадка компании: полная линейка массажных кресел и зона тест-драйва в центре города.",
      uz: "Kompaniyaning oltinchi maydoni: massaj kreslolarining to‘liq qatori va shahar markazidagi test-drayv zonasi.",
      en: "The company's sixth location: the full massage-chair line-up and a test-drive area in the city centre.",
    },
    cover: { src: "/images/blog/showroom.webp", width: 800, height: 500,
      alt: { ru: "Новый шоурум в Бухаре", uz: "Buxorodagi yangi shourum", en: "The new Bukhara showroom" } },
  },
];

/**
 * Maqola matni `post-bodies.ts` dan qo'shiladi.
 *
 * Ro'yxat va matn alohida turgani uchun `posts.ts` ixcham jadval bo'lib
 * qoladi; bosh sahifadagi blok va katalog kartalari matnni umuman
 * o'qimaydi.
 */
export const posts: Post[] = list.map((post) => ({
  ...post,
  body: postBodies[post._id],
}));
