import type { FaqItem } from "./types";

export const faq: FaqItem[] = [
  {
    _id: "faq-warranty",
    question: { ru: "Какая гарантия на массажные кресла?", uz: "Massaj kreslolariga qanday kafolat beriladi?", en: "What warranty do the massage chairs carry?" },
    answer: {
      ru: "На все кресла iSpace действует официальная гарантия 3 года на механику и 1 год на обивку. Сервисное обслуживание выполняет наша собственная служба во всех шести городах.",
      uz: "Barcha iSpace kreslolariga mexanika uchun 3 yil, qoplama uchun 1 yil rasmiy kafolat beriladi. Servis oltita shaharda o‘z xizmatimiz tomonidan bajariladi.",
      en: "Every iSpace chair carries an official 3-year warranty on the mechanics and 1 year on the upholstery. Servicing is handled by our own team in all six cities.",
    },
  },
  {
    _id: "faq-instalment",
    question: { ru: "Можно ли купить в рассрочку?", uz: "Bo‘lib to‘lash mumkinmi?", en: "Can I buy in instalments?" },
    answer: {
      ru: "Да. Рассрочка до 12 месяцев без переплаты оформляется прямо в шоуруме за 15 минут — нужен только паспорт.",
      uz: "Ha. 12 oygacha ustama to‘lovsiz bo‘lib to‘lash to‘g‘ridan-to‘g‘ri shourumda 15 daqiqada rasmiylashtiriladi — faqat pasport kerak.",
      en: "Yes. Interest-free instalments for up to 12 months are arranged in the showroom in 15 minutes — you only need your passport.",
    },
  },
  {
    _id: "faq-delivery",
    question: { ru: "Сколько стоит доставка и установка?", uz: "Yetkazib berish va o‘rnatish qancha turadi?", en: "How much do delivery and installation cost?" },
    answer: {
      ru: "По Ташкенту доставка и сборка бесплатные. В другие города — по тарифу перевозчика; установку и обучение наш специалист проводит бесплатно.",
      uz: "Toshkent bo‘ylab yetkazish va yig‘ish bepul. Boshqa shaharlarga — tashuvchi tarifi bo‘yicha; o‘rnatish va o‘rgatishni mutaxassisimiz bepul bajaradi.",
      en: "Delivery and assembly are free within Tashkent. To other cities the carrier's rate applies; installation and training by our specialist are free.",
    },
  },
  {
    _id: "faq-testdrive",
    question: { ru: "Можно ли попробовать кресло перед покупкой?", uz: "Sotib olishdan oldin kreslo sinab ko‘rsa bo‘ladimi?", en: "Can I try a chair before buying?" },
    answer: {
      ru: "Конечно. Запишитесь на тест-драйв — мы подготовим модели под ваш рост и запрос, а консультант подберёт подходящую программу массажа.",
      uz: "Albatta. Test-drayvga yoziling — bo‘yingiz va so‘rovingizga mos modellarni tayyorlaymiz, konsultant esa mos massaj dasturini tanlaydi.",
      en: "Of course. Book a test drive — we will prepare models suited to your height and needs, and a consultant will select the right massage programme.",
    },
  },
  {
    _id: "faq-size",
    question: { ru: "Сколько места нужно для кресла?", uz: "Kreslo uchun qancha joy kerak?", en: "How much space does a chair need?" },
    answer: {
      ru: "В разложенном виде креслу нужно около 1,9 × 0,9 м. Модели с функцией Space Saving отъезжают вперёд, поэтому от стены достаточно 10 см.",
      uz: "Yozilgan holatda kresloga taxminan 1,9 × 0,9 m joy kerak. Space Saving funksiyali modellar oldinga suriladi, shuning uchun devordan 10 sm yetarli.",
      en: "Reclined, a chair needs roughly 1.9 × 0.9 m. Space Saving models glide forward, so 10 cm from the wall is enough.",
    },
  },
  {
    _id: "faq-contraindications",
    question: { ru: "Есть ли противопоказания?", uz: "Qarshi ko‘rsatmalar bormi?", en: "Are there any contraindications?" },
    answer: {
      ru: "При беременности, тромбозе, онкологии, свежих травмах и кардиостимуляторе перед использованием нужно проконсультироваться с врачом. Наш консультант подскажет щадящие программы.",
      uz: "Homiladorlik, tromboz, onkologiya, yangi jarohat va kardiostimulyator bo‘lsa, foydalanishdan oldin shifokor bilan maslahatlashish kerak. Konsultantimiz yumshoq dasturlarni tavsiya qiladi.",
      en: "With pregnancy, thrombosis, cancer, recent injuries or a pacemaker, consult a doctor before use. Our consultant can recommend gentler programmes.",
    },
  },
];
