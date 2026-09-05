import type { LocaleString, Media, ProductOption, ProductStoryBlock, SpecRow } from "./types";

/**
 * Mahsulot sahifasining "og'ir" kontenti — tavsif, xarakteristikalar,
 * variantlar va hikoya bloklari.
 *
 * Nega alohida fayl: `products.ts` katalog uchun ixcham jadval bo'lib
 * qolsin. Bu yerdagi ma'lumot faqat batafsil sahifada kerak va CMS
 * ulanganda ham alohida hujjat bo'ladi.
 */

const L = (ru: string, uz: string, en: string): LocaleString => ({ ru, uz, en });

/** Uch tilda bir xil qatorli xarakteristika yasovchi yordamchi. */
const spec = (label: LocaleString, value: LocaleString): SpecRow => ({ label, value });

const SPEC_LABELS = {
  brand: L("Бренд", "Brend", "Brand"),
  model: L("Модель", "Model", "Model"),
  type: L("Тип", "Turi", "Type"),
  tech: L("Технология массажа", "Massaj texnologiyasi", "Massage technology"),
  mode: L("Режим", "Rejim", "Mode"),
  programs: L("Автоматических программ", "Avtomatik dasturlar", "Automatic programmes"),
  heat: L("Прогрев", "Isitish", "Heating"),
  control: L("Управление", "Boshqaruv", "Control"),
  colors: L("Цвета", "Ranglar", "Colours"),
  warranty: L("Гарантия", "Kafolat", "Warranty"),
  power: L("Мощность", "Quvvat", "Power"),
  maxWeight: L("Макс. нагрузка", "Maks. yuk", "Max. load"),
  size: L("Размеры", "O‘lchamlari", "Dimensions"),
} as const;

/** Yetkazib berish va to'lov sharti — barcha mahsulotlar uchun bir xil. */
export const delivery = L(
  "Доставка по Ташкенту — бесплатно, по Узбекистану — в течение 2–5 дней. Оплата наличными, картой или в рассрочку до 12 месяцев. Установка и обучение входят в стоимость.",
  "Toshkent bo‘ylab yetkazib berish — bepul, O‘zbekiston bo‘ylab — 2–5 kun ichida. To‘lov naqd, karta yoki 12 oygacha bo‘lib to‘lash. O‘rnatish va o‘rgatish narxga kiradi.",
  "Delivery in Tashkent is free; across Uzbekistan within 2–5 days. Pay by cash, card or in instalments up to 12 months. Installation and training are included.",
);

/** Umumiy rang palitrasi — kreslolar uchun. */
export const chairColors: ProductOption[] = [
  { _id: "beige", label: L("Бежевый", "Bej", "Beige"), hex: "#d8c7ac" },
  { _id: "espresso", label: L("Тёмно-коричневый", "To‘q jigarrang", "Espresso"), hex: "#4a3a2e" },
  { _id: "graphite", label: L("Графитовый", "Grafit", "Graphite"), hex: "#43474b" },
  { _id: "ivory", label: L("Слоновая кость", "Fil suyagi", "Ivory"), hex: "#efe7d9" },
];

/** Komplektatsiyalar — narx farqi bilan. */
export const bundles: ProductOption[] = [
  { _id: "standard", label: L("Стандарт", "Standart", "Standard") },
  { _id: "extended", label: L("Расширенная", "Kengaytirilgan", "Extended"), extra: 1_200_000 },
];

/* ------------------------------------------------------------------ */
/* Hikoya bloklari                                                     */
/* ------------------------------------------------------------------ */

/**
 * Media e'lon qilinadi, lekin sahifada u faqat admin orqali YUKLANGANDAN
 * keyin paydo bo'ladi (`Media.uploaded`). Shu sabab bu yerda barcha
 * bloklarni oldindan yozib qo'yish xavfsiz.
 */
const m = (src: string, alt: LocaleString, width: number, height: number): Media => ({
  src,
  width,
  height,
  alt,
});

/** Massaj kreslosi uchun hikoya — maketdagi besh konteyner. */
export function chairStory(slug: string, name: string): ProductStoryBlock[] {
  const base = `/images/products/${slug}/story`;
  const alt = (s: string) => L(`${name} — ${s}`, `${name} — ${s}`, `${name} — ${s}`);

  return [
    {
      _id: "hero",
      layout: "wide",
      media: [m(`${base}-1.webp`, alt("обзор"), 1600, 900)],
    },
    {
      _id: "modules",
      layout: "split",
      title: L("3 независимых массажных модуля", "3 ta mustaqil massaj moduli", "3 independent massage modules"),
      text: L(
        "Продвинутая технология массажа, максимально приближённая к ощущению от рук профессионального массажиста. Три модуля работают синхронно и охватывают спину, поясницу и плечи.",
        "Professional massajchi qo‘llariga eng yaqin ilg‘or massaj texnologiyasi. Uch modul birgalikda ishlab, bel, kurak va yelkani qamrab oladi.",
        "Advanced massage technology as close as it gets to a professional therapist's hands. Three modules work in sync across the back, lower back and shoulders.",
      ),
      media: [m(`${base}-2.webp`, alt("модули"), 1200, 900)],
      thumbs: [
        m(`${base}-2a.webp`, alt("модуль 1"), 400, 300),
        m(`${base}-2b.webp`, alt("модуль 2"), 400, 300),
        m(`${base}-2c.webp`, alt("модуль 3"), 400, 300),
      ],
    },
    {
      _id: "air",
      layout: "split",
      reverse: true,
      title: L("Воздушные подушки по всему телу", "Butun tana bo‘ylab havo yostiqchalari", "Air cushions across the body"),
      text: L(
        "Сеть воздушных подушек мягко обхватывает плечи, руки, бёдра и стопы. Давление регулируется, а режимы чередуются — мышцы расслабляются равномерно.",
        "Havo yostiqchalari tarmog‘i yelka, qo‘l, son va oyoq panjasini yumshoq qamrab oladi. Bosim sozlanadi, rejimlar almashadi — mushaklar bir tekis bo‘shashadi.",
        "A network of air cushions gently wraps the shoulders, arms, hips and feet. Pressure is adjustable and modes alternate, so muscles release evenly.",
      ),
      media: [m(`${base}-3.webp`, alt("воздушные подушки"), 1200, 900)],
      thumbs: [
        m(`${base}-3a.webp`, alt("подушки 1"), 400, 300),
        m(`${base}-3b.webp`, alt("подушки 2"), 400, 300),
        m(`${base}-3c.webp`, alt("подушки 3"), 400, 300),
      ],
    },
    {
      _id: "zerog",
      layout: "wide",
      title: L("3 положения невесомости", "3 ta vaznsizlik holati", "3 zero-gravity positions"),
      text: L(
        "Кресло поднимает ноги выше уровня сердца и равномерно распределяет вес тела — нагрузка на позвоночник почти исчезает. Так восстанавливаются глубокие мышцы спины.",
        "Kreslo oyoqlarni yurak sathidan yuqoriga ko‘taradi va tana og‘irligini bir tekis taqsimlaydi — umurtqaga yuk deyarli yo‘qoladi. Belning chuqur mushaklari shunda tiklanadi.",
        "The chair lifts your legs above heart level and spreads body weight evenly, so load on the spine all but disappears — that is when deep back muscles recover.",
      ),
      media: [m(`${base}-4.webp`, alt("невесомость"), 1600, 900)],
    },
    {
      _id: "programs",
      layout: "pair",
      title: L("Автоматические программы", "Avtomatik dasturlar", "Automatic programmes"),
      text: L(
        "Готовые сценарии на каждый день: восстановление после тренировки, снятие усталости, глубокое расслабление перед сном.",
        "Har kunga tayyor stsenariylar: mashg‘ulotdan keyin tiklanish, charchoqni ketkazish, uyqudan oldin chuqur bo‘shashish.",
        "Ready-made routines for every day: post-workout recovery, fatigue relief, and deep relaxation before sleep.",
      ),
      media: [
        m(`${base}-5a.webp`, alt("программа 1"), 900, 1100),
        m(`${base}-5b.webp`, alt("программа 2"), 900, 1100),
      ],
    },
  ];
}

/** Massaj kreslosining xarakteristikalari. */
export function chairSpecs(o: {
  model: string;
  tech: string;
  programs: string;
  power: string;
  maxWeight: string;
  size: string;
}): SpecRow[] {
  return [
    spec(SPEC_LABELS.brand, L("iSpace", "iSpace", "iSpace")),
    spec(SPEC_LABELS.model, L(o.model, o.model, o.model)),
    spec(SPEC_LABELS.type, L("Массажное кресло", "Massaj kreslosi", "Massage chair")),
    spec(SPEC_LABELS.tech, L(o.tech, o.tech, o.tech)),
    spec(SPEC_LABELS.mode, L("Zero Gravity", "Zero Gravity", "Zero Gravity")),
    spec(SPEC_LABELS.programs, L(o.programs, o.programs, o.programs)),
    spec(SPEC_LABELS.heat, L("Поясница и стопы", "Bel va oyoq panjasi", "Lower back and feet")),
    spec(SPEC_LABELS.control, L("Пульт и сенсорный экран", "Pult va sensorli ekran", "Remote and touchscreen")),
    spec(SPEC_LABELS.power, L(o.power, o.power, o.power)),
    spec(SPEC_LABELS.maxWeight, L(o.maxWeight, o.maxWeight, o.maxWeight)),
    spec(SPEC_LABELS.size, L(o.size, o.size, o.size)),
    spec(SPEC_LABELS.warranty, L("12 месяцев", "12 oy", "12 months")),
  ];
}

/** Fitnes-jihoz uchun soddaroq jadval. */
export function fitnessSpecs(o: {
  model: string;
  type: LocaleString;
  power: string;
  maxWeight: string;
  size: string;
}): SpecRow[] {
  return [
    spec(SPEC_LABELS.brand, L("iSpace", "iSpace", "iSpace")),
    spec(SPEC_LABELS.model, L(o.model, o.model, o.model)),
    spec(SPEC_LABELS.type, o.type),
    spec(SPEC_LABELS.power, L(o.power, o.power, o.power)),
    spec(SPEC_LABELS.maxWeight, L(o.maxWeight, o.maxWeight, o.maxWeight)),
    spec(SPEC_LABELS.size, L(o.size, o.size, o.size)),
    spec(SPEC_LABELS.warranty, L("12 месяцев", "12 oy", "12 months")),
  ];
}

export { L };
