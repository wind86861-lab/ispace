import type { Review } from "./types";

export const reviews: Review[] = [
  {
    _id: "rv-1", rating: 5, publishedAt: "2026-03-15",
    author: { ru: "Алексей М.", uz: "Aleksey M.", en: "Alexey M." },
    text: {
      ru: "Отличный сервис и качественная техника. Кресло привезли и собрали в тот же день, всё показали и объяснили.",
      uz: "Ajoyib xizmat va sifatli texnika. Kreslo o‘sha kuniyoq keltirilib yig‘ildi, hammasini ko‘rsatib tushuntirishdi.",
      en: "Great service and quality equipment. The chair was delivered and assembled the same day, with a full walkthrough.",
    },
  },
  {
    _id: "rv-2", rating: 5, publishedAt: "2026-02-28",
    author: { ru: "Дилноза Р.", uz: "Dilnoza R.", en: "Dilnoza R." },
    text: {
      ru: "Долго выбирала между моделями. В шоуруме дали спокойно посидеть в каждой — это решило всё.",
      uz: "Modellar orasidan uzoq tanladim. Shourumda har biriga bemalol o‘tirib ko‘rishga ruxsat berishdi — shu hal qildi.",
      en: "I spent a long time choosing. In the showroom they let me sit in each one calmly — that settled it.",
    },
  },
  {
    _id: "rv-3", rating: 5, publishedAt: "2026-02-10",
    author: { ru: "Сардор Т.", uz: "Sardor T.", en: "Sardor T." },
    text: {
      ru: "Взяли кресло в офис для сотрудников. Спина после рабочего дня совсем другая. Рассрочка оформилась быстро.",
      uz: "Xodimlar uchun ofisga kreslo oldik. Ish kunidan keyin bel butunlay boshqacha. Bo‘lib to‘lash tez rasmiylashtirildi.",
      en: "We bought a chair for the office team. Backs feel completely different after a workday. Instalments were quick to arrange.",
    },
  },
  {
    _id: "rv-4", rating: 4, publishedAt: "2026-01-22",
    author: { ru: "Наргиза К.", uz: "Nargiza K.", en: "Nargiza K." },
    text: {
      ru: "Кресло супер, доставка немного задержалась, но менеджер держал в курсе и предупредил заранее.",
      uz: "Kreslo zo‘r, yetkazish biroz kechikdi, lekin menejer oldindan ogohlantirib, xabardor qilib turdi.",
      en: "The chair is superb; delivery ran slightly late, but the manager warned me in advance and kept me posted.",
    },
  },
  {
    _id: "rv-5", rating: 5, publishedAt: "2026-01-09",
    author: { ru: "Жасур И.", uz: "Jasur I.", en: "Jasur I." },
    text: {
      ru: "Сервис приехал по гарантии через два дня после обращения. Заменили деталь бесплатно, без вопросов.",
      uz: "Servis murojaatdan ikki kun o‘tib kafolat bo‘yicha keldi. Detalni bepul, savolsiz almashtirib berishdi.",
      en: "Service came out under warranty two days after I called. They replaced the part free of charge, no questions.",
    },
  },
];
