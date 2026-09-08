import type { ClientService } from "./types";

/**
 * «Mijozlarga» sahifasining to'rt bo'limi.
 *
 * Matnlar bu yerda URUG' sifatida turadi va admin orqali tahrirlanadi
 * (`data/content/services.json`). Media uyalari BO'SH: har blokning
 * rasmi yoki videosi admin panelidan yuklanadi va yuklanmaguncha
 * sahifada bo'sh ramka ko'rinmaydi.
 */
export const services: ClientService[] = [
  {
    _id: "sv-test-drive",
    slug: "test-drive",
    icon: "armchair",
    eyebrow: { ru: "Тест-драйв", uz: "Test-drayv" },
    title: { ru: "iSpace у вас дома", uz: "iSpace uyingizda" },
    lead: {
      ru: "Хотите попробовать массажное кресло, не выходя из дома? Мы привезём выбранное кресло iSpace прямо к вам, установим его и дадим спокойно протестировать все основные функции, режимы и программы массажа в комфортной для вас обстановке.",
      uz: "Uydan chiqmasdan massaj kreslosini sinab ko‘rishni xohlaysizmi? Siz tanlagan iSpace kreslosini to‘g‘ridan-to‘g‘ri uyingizga olib boramiz, o‘rnatamiz va qulay sharoitda barcha asosiy funksiya, rejim va massaj dasturlarini bemalol sinab ko‘rish imkonini beramiz.",
    },
    points: [
      { ru: "Привозим и устанавливаем кресло у вас дома", uz: "Kresloni uyingizga keltirib o‘rnatamiz" },
      { ru: "Все основные функции, режимы и программы массажа", uz: "Barcha asosiy funksiya, rejim va massaj dasturlari" },
      { ru: "Стоимость услуги — 500 000 сум", uz: "Xizmat narxi — 500 000 so‘m" },
      { ru: "При покупке эта сумма полностью вычитается из стоимости кресла", uz: "Xarid qilsangiz bu summa kreslo narxidan to‘liq chegiriladi" },
    ],
    stat: {
      value: "500 000",
      unit: { ru: "сум", uz: "so‘m" },
      label: { ru: "Тест-драйв дома — вычитается при покупке", uz: "Uyda test-drayv — xaridda chegiriladi" },
    },
    media: {
      src: "",
      alt: { ru: "Тест-драйв массажного кресла дома", uz: "Massaj kreslosining uydagi test-drayvi" },
    },
    outro: {
      ru: "Выбирайте не по картинке — попробуйте сами и найдите кресло, которое подходит именно вам.",
      uz: "Rasmga qarab emas — o‘zingiz sinab ko‘ring va aynan sizga mos kresloni tanlang.",
    },
  },
  {
    _id: "sv-installment",
    slug: "installment",
    icon: "credit-card",
    eyebrow: { ru: "Рассрочка", uz: "Muddatli to‘lov" },
    title: {
      ru: "Рассрочка напрямую от iSpace",
      uz: "To‘g‘ridan-to‘g‘ri iSpace’dan muddatli to‘lov",
    },
    lead: {
      ru: "Покупайте массажные кресла iSpace в рассрочку напрямую от компании. Никаких банков, кредитных организаций и банковских процентов — финансирование предоставляет сам iSpace из собственных средств.",
      uz: "iSpace massaj kreslolarini kompaniyaning o‘zidan to‘g‘ridan-to‘g‘ri muddatli to‘lov asosida xarid qiling. Hech qanday bank, kredit tashkiloti yoki bank foizlari yo‘q — xaridni iSpace o‘z mablag‘lari hisobidan moliyalashtiradi.",
    },
    points: [
      { ru: "Первоначальный взнос — 30% от стоимости", uz: "Boshlang‘ich to‘lov — narxning 30%" },
      { ru: "Оставшиеся 70% — на 3 месяца", uz: "Qolgan 70% — 3 oyga" },
      { ru: "0% процентов", uz: "0% foiz" },
      { ru: "Без банков и посредников", uz: "Banklar va vositachilarsiz" },
      { ru: "Без переплат и без пени", uz: "Ortiqcha to‘lov va penyasiz" },
      { ru: "Точная сумма каждого платежа известна заранее", uz: "Har bir to‘lov miqdori oldindan aniq" },
    ],
    stat: {
      value: "30%",
      unit: { ru: "взнос", uz: "boshlang‘ich" },
      label: { ru: "Остальное — 3 месяца под 0%", uz: "Qolgani — 3 oyga, 0% foiz" },
    },
    media: {
      src: "",
      alt: { ru: "Рассрочка от iSpace", uz: "iSpace’dan muddatli to‘lov" },
    },
    outro: {
      ru: "30% сегодня, остальное за 3 месяца. Без процентов. Без банков. Без переплат.",
      uz: "Bugun 30%, qolgani 3 oyda. Foizsiz. Banksiz. Ortiqcha to‘lovlarsiz.",
    },
  },
  {
    _id: "sv-warranty",
    slug: "warranty",
    icon: "shield",
    eyebrow: { ru: "Гарантия и сервис", uz: "Kafolat va servis" },
    title: {
      ru: "Гарантия от 1 года до 3 лет",
      uz: "1 yildan 3 yilgacha kafolat",
    },
    lead: {
      ru: "Мы уверены в качестве массажных кресел iSpace и сопровождаем клиента не только во время покупки, но и после неё. При неисправности достаточно обратиться в сервис iSpace: специалисты проведут диагностику, определят причину и выполнят ремонт в рамках гарантии.",
      uz: "Biz iSpace massaj kreslolarining sifatiga ishonamiz va mijozni nafaqat xarid vaqtida, balki xariddan keyin ham qo‘llab-quvvatlaymiz. Nosozlikda iSpace servisiga murojaat qilish kifoya: mutaxassislar diagnostika o‘tkazadi, sababini aniqlaydi va kafolat doirasida ta’mirlaydi.",
    },
    points: [
      { ru: "Гарантия от 1 до 3 лет — в зависимости от модели", uz: "Modelga qarab 1 yildan 3 yilgacha kafolat" },
      { ru: "Собственная сервисная поддержка", uz: "O‘z servis xizmati" },
      { ru: "Квалифицированные специалисты", uz: "Malakali mutaxassislar" },
      { ru: "Необходимые запасные части", uz: "Zarur ehtiyot qismlar" },
      { ru: "Диагностика и гарантийный ремонт", uz: "Diagnostika va kafolatli ta’mirlash" },
      { ru: "Поддержка и после окончания гарантии", uz: "Kafolat tugagandan keyin ham yordam" },
    ],
    stat: {
      value: "1–3",
      unit: { ru: "года", uz: "yil" },
      label: { ru: "Официальная гарантия — зависит от модели", uz: "Rasmiy kafolat — modelga qarab" },
    },
    media: {
      src: "",
      alt: { ru: "Сервис iSpace", uz: "iSpace servisi" },
    },
    outro: {
      ru: "iSpace — мы остаёмся рядом и после покупки.",
      uz: "iSpace — xariddan keyin ham doimo yoningizda.",
    },
  },
  {
    _id: "sv-delivery",
    slug: "delivery",
    icon: "truck",
    eyebrow: { ru: "Доставка", uz: "Yetkazib berish" },
    title: {
      ru: "Доставка по всему Узбекистану",
      uz: "O‘zbekiston bo‘ylab yetkazib berish",
    },
    lead: {
      ru: "Мы доставляем массажные кресла iSpace по всей территории Узбекистана быстро и бесплатно. Если в вашем регионе есть шоурум iSpace — доставка в день заказа. Если шоурума нет — доставка занимает 1–2 рабочих дня.",
      uz: "iSpace massaj kreslolarini O‘zbekistonning barcha hududlariga tez va bepul yetkazib beramiz. Hududingizda iSpace shourumi bo‘lsa — buyurtma shu kunning o‘zida yetkaziladi. Shourum bo‘lmasa — yetkazish 1–2 ish kunini oladi.",
    },
    points: [
      { ru: "Бесплатная доставка по Узбекистану", uz: "O‘zbekiston bo‘ylab bepul yetkazib berish" },
      { ru: "В день заказа при наличии шоурума", uz: "Shourum mavjud hududlarda — shu kuni" },
      { ru: "1–2 дня в остальные регионы", uz: "Boshqa hududlarga — 1–2 ish kuni" },
      { ru: "Профессиональная установка и проверка оборудования", uz: "Professional o‘rnatish va tekshirish" },
    ],
    stat: {
      value: "1–2",
      unit: { ru: "дня", uz: "kun" },
      label: { ru: "В регионы без шоурума. Со шоурумом — в день заказа", uz: "Shourumsiz hududlarga. Shourum bo‘lsa — shu kuni" },
    },
    media: {
      src: "",
      alt: { ru: "Доставка iSpace по Узбекистану", uz: "iSpace’ning O‘zbekiston bo‘ylab yetkazib berishi" },
    },
    outro: {
      ru: "Хотите узнать, есть ли филиал iSpace в вашем городе? Выберите ближайший шоурум.",
      uz: "Shahringizda iSpace filiali bormi? Eng yaqin shourumni tanlang.",
    },
  },
];
