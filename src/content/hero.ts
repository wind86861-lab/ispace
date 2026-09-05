import type { HeroSlide, TrustItem } from "./types";

export const hero: HeroSlide[] = [
  {
    _id: "hero-premium",
    eyebrow: { ru: "Премиум", uz: "Premium", en: "Premium" },
    title:  { ru: "Премиум комфорт",     uz: "Premium qulaylik",       en: "Premium comfort" },
    accent: { ru: "для вашего здоровья", uz: "sog‘lig‘ingiz uchun",    en: "for your wellbeing" },
    text: {
      ru: "Инновационные массажные кресла для полного расслабления и восстановления сил.",
      uz: "To‘liq dam olish va kuch tiklash uchun innovatsion massaj kreslolari.",
      en: "Innovative massage chairs for complete relaxation and recovery.",
    },
    image: {
      src: "/images/hero/hero-premium.webp",
      alt: {
        ru: "Премиальное массажное кресло iSpace в светлом интерьере",
        uz: "Yorug‘ interyerdagi premium iSpace massaj kreslosi",
        en: "Premium iSpace massage chair in a bright interior",
      },
      width: 1600, height: 1100,
    },
    ctas: [
      { href: "#categories", variant: "gold",    label: { ru: "Перейти в каталог",      uz: "Katalogga o‘tish",    en: "Browse catalog" } },
      { href: "#consult",    variant: "outline", label: { ru: "Получить консультацию",  uz: "Konsultatsiya olish", en: "Get a consultation" } },
    ],
  },
  {
    _id: "hero-technology",
    eyebrow: { ru: "Технологии", uz: "Texnologiya", en: "Technology" },
    title:  { ru: "4D-массаж",            uz: "4D massaj",              en: "4D massage" },
    accent: { ru: "который знает ваше тело", uz: "tanangizni biladigan", en: "that knows your body" },
    text: {
      ru: "Сканирование позвоночника, невесомость и 12 программ — кресло подстраивается под вас.",
      uz: "Umurtqani skanerlash, vaznsizlik va 12 dastur — kreslo sizga moslashadi.",
      en: "Spinal scanning, zero-gravity and 12 programmes — the chair adapts to you.",
    },
    image: {
      src: "/images/hero/hero-technology.webp",
      alt: {
        ru: "Массажное кресло в положении невесомости",
        uz: "Vaznsizlik holatidagi massaj kreslosi",
        en: "Massage chair in zero-gravity position",
      },
      width: 1600, height: 1100,
    },
    ctas: [
      { href: "#products", variant: "gold",    label: { ru: "Смотреть модели",  uz: "Modellarni ko‘rish", en: "See the models" } },
      { href: "#consult",  variant: "outline", label: { ru: "Записаться на тест-драйв", uz: "Test-drayvga yozilish", en: "Book a test drive" } },
    ],
  },
  {
    _id: "hero-showroom",
    eyebrow: { ru: "Шоурум", uz: "Shourum", en: "Showroom" },
    title:  { ru: "Попробуйте",            uz: "Sinab ko‘ring",         en: "Try it" },
    accent: { ru: "прежде чем выбрать",    uz: "tanlashdan oldin",      en: "before you choose" },
    text: {
      ru: "6 шоурумов по Узбекистану. Приходите — мы подберём кресло под ваш рост и запрос.",
      uz: "O‘zbekiston bo‘ylab 6 ta shourum. Keling — bo‘yingiz va ehtiyojingizga mos kreslo tanlaymiz.",
      en: "Six showrooms across Uzbekistan. Come in — we will match a chair to your body and needs.",
    },
    image: {
      src: "/images/hero/hero-showroom.webp",
      alt: {
        ru: "Шоурум iSpace с массажными креслами",
        uz: "Massaj kreslolari bilan iSpace shourumi",
        en: "iSpace showroom with massage chairs",
      },
      width: 1600, height: 1100,
    },
    ctas: [
      { href: "#branches", variant: "gold",    label: { ru: "Найти шоурум",    uz: "Shourum topish", en: "Find a showroom" } },
      { href: "#consult",  variant: "outline", label: { ru: "Задать вопрос",   uz: "Savol berish",   en: "Ask a question" } },
    ],
  },
];

export const trust: TrustItem[] = [
  { _id: "t-premium",   icon: "award",       label: { ru: "Премиальные товары",  uz: "Premium mahsulotlar",   en: "Premium products" } },
  { _id: "t-warranty",  icon: "shield",      label: { ru: "Гарантия и сервис",   uz: "Kafolat va servis",     en: "Warranty & service" } },
  { _id: "t-instalment",icon: "credit-card", label: { ru: "Рассрочка",           uz: "Bo‘lib to‘lash",        en: "Instalments" } },
  { _id: "t-delivery",  icon: "truck",       label: { ru: "Доставка и установка",uz: "Yetkazish va o‘rnatish",en: "Delivery & setup" } },
];
