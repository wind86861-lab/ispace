/**
 * Kontent modeli — ataylab Sanity hujjat shaklida yozilgan.
 * Kelajakda CMS ulanganda faqat `content/index.ts` dagi `getContent()`
 * GROQ so'roviga aylanadi; komponentlar bu tiplarni ko'rishda davom etadi.
 */
import type { Locale } from "@/i18n/routing";

/** Sanity'dagi `localeString` obyektining aynan ekvivalenti. */
/**
 * Ko'p tilli matn.
 *
 * `en` ATAYLAB ixtiyoriy qoldirildi: ingliz versiyasi olib tashlandi,
 * lekin kontent fayllarida `en:` maydonlari hamon yuzlab joyda uchraydi.
 * Ularni qirqib chiqish minglab qatorni o'zgartirardi va hech qanday
 * foyda bermasdi — maydon shunchaki e'tiborga olinmaydi va admin
 * saqlaganda o'zi yo'qoladi.
 */
export type LocaleString = Record<Locale, string> & { en?: string };

export type Media = {
  src: string;
  /**
   * Rasm maydonga qanday joylashadi. Admin orqali yuklanganda avtomatik
   * aniqlanadi: xona fotosi `cover`, oq fonli mahsulot fotosi `contain`
   * (kesilmasligi uchun). Belgilanmagan bo'lsa — `cover`.
   */
  fit?: "cover" | "contain";
  /** `contain` uchun orqa fon rangi — rasmning o'z fonidan olinadi. */
  bg?: string;
  /** `next/image` blur-placeholder uchun (kichik base64 yoki rang). */
  blur?: string;
  /**
   * `true` — bu rasm admin orqali HAQIQATAN yuklangan (o'rindosh emas).
   * `applyOverrides` qo'yadi, kontent fayllarida yozilmaydi.
   *
   * Mahsulot sahifasidagi hikoya bloklari shunga qarab chiziladi:
   * rasm yuklanmagan bo'lsa blok umuman ko'rsatilmaydi — foydalanuvchi
   * bo'sh gradient o'rindoshni ko'rmaydi.
   */
  uploaded?: boolean;
  alt: LocaleString;
  width?: number;
  height?: number;
};

export type Cta = {
  label: LocaleString;
  href: string;
  variant?: "gold" | "outline" | "ghost";
};

/* ------------------------------------------------------------------ */

export type HeroSlide = {
  _id: string;
  eyebrow: LocaleString;
  /** `|` belgisi qatorga bo'lish nuqtasi — SplitText shu bo'yicha ochadi. */
  title: LocaleString;
  accent: LocaleString;
  text: LocaleString;
  image: Media;
  ctas: [Cta, Cta];
};

export type TrustItem = {
  _id: string;
  icon: IconName;
  label: LocaleString;
};

/**
 * Blog bo'limining fon rasmi.
 *
 * Maqolalarning o'zi `posts` da — bu yerda faqat bo'lim SIRTI.
 */
export type BlogSection = {
  /** Ixtiyoriy: yuklanmagan bo'lsa bo'lim tekis krem fonda qoladi. */
  background: Media;
  /**
   * `/blog` sahifasi tepasidagi banner — sarlavha bilan tablar orasida.
   *
   * Ham RASM, ham VIDEO bo'lishi mumkin: qaysi biri ekani fayl
   * kengaytmasidan aniqlanadi (`SmartMedia`). Ixtiyoriy — yuklanmagan
   * bo'lsa sahifa hozirgidek bannersiz qoladi.
   */
  banner: Media;
};

export type Category = {
  _id: string;
  slug: string;
  title: LocaleString;
  /**
   * Katalog filtridagi ikon.
   *
   * Kategoriya RASMI (`image`) bu yerda ishlamaydi: u fotosurat va
   * 20px li chipda tanib bo'lmas dog'ga aylanadi. Shuning uchun
   * alohida belgi — hammasi bir xil qalinlikda chiziladi va qator
   * yaxlit ko'rinadi.
   */
  icon?: IconName;
  text?: LocaleString;
  image: Media;
  /** `true` — asimmetrik gridda katta kartani egallaydi. */
  featured?: boolean;
  /** `true` — pastda butun qatorni egallaydi (uzun banner-karta). */
  wide?: boolean;
};

/**
 * Mahsulot xususiyati — ikon + qisqa yorliq.
 * Kartada matn-chip o'rniga ikon ko'rsatiladi: bir qarashda o'qiladi va
 * uch tilda ham bir xil joy egallaydi.
 */
export type Feature = { icon: FeatureIcon; label: LocaleString };

/**
 * Mahsulot belgisi — kartadagi rasm ustida turadigan nishon.
 *
 * `Feature` dan farqi: ikoni KODDA emas, admin yuklaydigan rasm.
 * Shu sabab yangi texnologiya qo'shish uchun kodga tegish shart emas —
 * belgi yaratiladi, kerakli mahsulotlarda yoqiladi.
 */
export type Badge = {
  _id: string;
  /** Nishondagi asosiy yozuv — "4D", "SL", "ZERO". */
  label: LocaleString;
  /** Ostidagi kichik yozuv — "МАССАЖ", "КАРЕТКА". Ixtiyoriy. */
  sublabel?: LocaleString;
  /** Ikon — shaffof fonli PNG yoki SVG afzal. */
  image: Media;
  /** Ro'yxatdagi tartib. */
  rank: number;
};

/** Mahsulot varianti — rang yoki komplektatsiya. */
export type ProductOption = {
  _id: string;
  label: LocaleString;
  /** Rang uchun namuna; komplektatsiyada bo'lmaydi. */
  hex?: string;
  /** Asosiy narxga qo'shiladi (so'mda). */
  extra?: number;
};

/** Xarakteristika qatori — "Бренд: iSpace" kabi. */
export type SpecRow = { label: LocaleString; value: LocaleString };

/**
 * Mahsulot sahifasining pastki "hikoya" bloklari.
 *
 * Har biri IXTIYORIY va **mediasi yuklanmaguncha chizilmaydi**: blok
 * kontentda e'lon qilinadi, lekin foydalanuvchi uni faqat admin orqali
 * rasm yuklangandan keyin ko'radi. Shu sabab yangi mahsulot qo'shilganda
 * sahifa hech qachon bo'sh ramkalar bilan chiqmaydi.
 */
export type ProductStoryBlock = {
  _id: string;
  /**
   * `wide`  — bitta keng media, butun qatorni egallaydi;
   * `split` — matn va media yonma-yon (`reverse` bilan tomonlar almashadi);
   * `pair`  — ikkita media yonma-yon.
   */
  layout: "wide" | "split" | "pair";
  title?: LocaleString;
  text?: LocaleString;
  /** Asosiy media(lar). Blok BIRINCHISI yuklangandagina chiziladi. */
  media: Media[];
  /** `split` uchun kichik rasmlar qatori — ular ham alohida ixtiyoriy. */
  thumbs?: Media[];
  /** `split` da media chap tomonda tursin. */
  reverse?: boolean;
  /**
   * YouTube havolasi — media o'rniga video ko'rsatiladi.
   *
   * Fayl yuklashdan farqi: og'ir rolikni serverda saqlash shart emas
   * va uni YouTube o'zi turli sifatlarda beradi. Havola berilgan
   * bo'lsa u YUKLANGAN mediadan ustun turadi.
   *
   * Kontentda HAVOLA emas, ajratib olingan ID saqlanadi — shunda
   * chizishda uni har safar qayta tahlil qilish kerak bo'lmaydi va
   * noto'g'ri havola omborga umuman tushmaydi.
   */
  youtubeId?: string;
};

/**
 * Mahsulotni tashqi savdo maydonchasida sotib olish havolasi.
 *
 * Ikoni ADMIN YUKLAYDI: Uzum, Alif, Yandex Market, Wildberries —
 * ro'yxat vaqt o'tishi bilan o'zgaradi va uni kodda saqlash har safar
 * dasturchini talab qilardi.
 */
export type Marketplace = {
  _id: string;
  /** Ko'rinadigan nom — ikon yuklanmagan bo'lsa ham matn qoladi. */
  name: string;
  /** Tashqi havola; faqat `https://`. */
  url: string;
  /** Logotip — shaffof fonli PNG yoki SVG. */
  image: Media;
};

export type Product = {
  _id: string;
  slug: string;
  title: LocaleString;
  features: Feature[];
  price: number;
  oldPrice?: number;
  currency: "UZS";
  images: Media[];
  isNew?: boolean;
  category: string;
  /**
   * `true` — bosh sahifadagi «Популярные модели» blokida ko'rinadi.
   * Hech biri belgilanmagan bo'lsa blok `rank` bo'yicha birinchi
   * oltitasini ko'rsatadi, ya'ni hech qachon bo'sh qolmaydi.
   */
  featured?: boolean;
  /** Saralash uchun — mahsulotning katalogga qo'shilgan tartibi. */
  rank: number;
  /**
   * Kartadagi nishonlar — `Badge._id` lar ro'yxati.
   * Admin belgilarni bir marta yaratadi va har mahsulotda yoqadi.
   */
  badgeIds?: string[];

  /* --- batafsil sahifa uchun; hammasi ixtiyoriy --- */
  brand?: string;
  /** 0–5; sharhlar soni bilan birga ko'rsatiladi. */
  rating?: number;
  reviewCount?: number;
  /** Berilmasa "mavjud" deb hisoblanadi. */
  inStock?: boolean;
  description?: LocaleString;
  specs?: SpecRow[];
  delivery?: LocaleString;
  colors?: ProductOption[];
  /** Tashqi savdo maydonchalari — mahsulot sahifasida havola bo'lib chiqadi. */
  marketplaces?: Marketplace[];
  bundles?: ProductOption[];
  story?: ProductStoryBlock[];
};

export type Advantage = {
  _id: string;
  icon: IconName;
  title: LocaleString;
  text: LocaleString;
};

/**
 * Lead bandi ostidagi ishonch chizig'i — «Rasmiy kafolat», «Yetkazib
 * berish», «24/7 qo'llab-quvvatlash».
 *
 * `Advantage` dan farqi: bu qisqa JUFTLIK (sarlavha + bir qatorlik
 * izoh) va u bandning pastki chizig'ida yonma-yon turadi, alohida
 * karta emas. Shu sabab matn uzunligi ham qattiq cheklangan.
 */
export type TrustPoint = {
  _id: string;
  icon: IconName;
  title: LocaleString;
  text: LocaleString;
  /** Ro'yxatdagi tartib. */
  rank: number;
};

export type Stat = {
  _id: string;
  /** Counter shu songacha sanaydi. */
  value: number;
  /** `50 000+` dagi `+` kabi qo'shimcha. */
  suffix?: string;
  label: LocaleString;
};

export type About = {
  eyebrow: LocaleString;
  title: LocaleString;
  paragraphs: LocaleString[];
  stats: Stat[];
  gallery: Media[];
  video: {
    youtubeId: string;
    poster: Media;
    title: LocaleString;
    /**
     * Admin yuklagan video fayl.
     *
     * Yuklangan bo'lsa (`Media.uploaded`) lightbox YouTube o'rniga shuni
     * o'ynatadi — mijozning o'z videosi uchun YouTube kanal talab
     * qilinmaydi. Yuklanmasa `youtubeId` ishlaydi, ya'ni eski xatti-harakat
     * o'zgarmaydi.
     */
    file?: Media;
  };
  /**
   * Sertifikatlar va yutuqlar — «О компании» sahifasidagi qator.
   *
   * Har biri IXTIYORIY: yuklanmagani chizilmaydi (`Media.uploaded`).
   * Shu sabab uyalar oldindan e'lon qilinadi, lekin qator faqat
   * haqiqatan yuklangan sertifikatlar bilan to'ladi — bo'sh ramkalar
   * hech qachon ko'rinmaydi.
   */
  certificates?: Media[];
};

export type Partner = {
  _id: string;
  name: string;
  /** Monoxrom SVG logo — `public/images/partners/`. */
  logo: string;
};

export type Branch = {
  _id: string;
  /** `content/map/uzbekistan.json` → `cities` kalitiga mos kelishi shart. */
  mapId: string;
  city: LocaleString;
  district: LocaleString;
  address: LocaleString;
  phone: string;
  hours: LocaleString;
  mapsUrl: string;
  geo: { lat: number; lng: number };
  /**
   * Filial fotosi — «Магазины» sahifasidagi karta uchun.
   * Yuklanmagani chizilmaydi (`Media.uploaded`), o'rniga karta faqat
   * ma'lumot bilan qoladi.
   */
  photo?: Media;
  /** Qo'shimcha izoh — masalan qavat yoki mo'ljal. */
  note?: LocaleString;
};

export type PostCategory =
  | "all"
  | "massage"
  | "reviews"
  | "health"
  | "tips"
  | "news";

/**
 * Maqola tanasi — bloklar ketma-ketligi.
 *
 * Nega HTML satri emas: kontent uch tilda va admin panelidan
 * tahrirlanadi. Xom HTML bo'lsa har tahrirda uni tozalash (sanitize)
 * kerak bo'lardi va bitta yopilmagan teg butun sahifani buzardi.
 * Bloklarda esa har element o'z tipiga ega va React uni o'zi chizadi —
 * ya'ni sahifaga hech qachon begona razmetka tushmaydi.
 */
export type PostBlock =
  | { kind: "paragraph"; text: LocaleString }
  | { kind: "heading"; text: LocaleString }
  | { kind: "list"; items: LocaleString[] }
  | { kind: "quote"; text: LocaleString; author?: LocaleString }
  /** Rasm YUKLANMAGAN bo'lsa blok chizilmaydi (`Media.uploaded`). */
  | { kind: "image"; media: Media };

export type Post = {
  _id: string;
  slug: string;
  category: Exclude<PostCategory, "all">;
  title: LocaleString;
  excerpt: LocaleString;
  cover: Media;
  /** ISO 8601 — locale bo'yicha formatlanadi. */
  publishedAt: string;
  readingMinutes: number;
  /** Maqola matni. Bo'sh bo'lsa sahifada faqat qisqacha mazmun qoladi. */
  body?: PostBlock[];
  author?: LocaleString;
  /** `true` — bosh sahifadagi blok qatorida ko'rinadi. */
  featured?: boolean;
};

export type Review = {
  _id: string;
  author: LocaleString;
  rating: 1 | 2 | 3 | 4 | 5;
  text: LocaleString;
  publishedAt: string;
  /**
   * Mijoz yuborgan fotolar. Yuklanmagani chizilmaydi — sharh ostida
   * bo'sh o'rindosh ramka turmasligi uchun (`Media.uploaded`).
   */
  photos?: Media[];
  /** YouTube video ID — sharhga video izoh biriktirilganda. */
  youtubeId?: string;
};

export type FaqItem = {
  _id: string;
  question: LocaleString;
  answer: LocaleString;
};

export type NavItem = {
  _id: string;
  label: LocaleString;
  href: string;
};

/** "Kerakli mahsulotni topmadingizmi?" bo'limi. */
export type Lead = { image: Media };

export type SiteContact = {
  phone: string;
  phoneHref: string;
  email: string;
  telegram: string;
  instagram: string;
  facebook: string;
  youtube: string;
};

/* ------------------------------------------------------------------ */

/**
 * Ikonlar nomma-nom — `lucide-react` dan faqat shular import qilinadi,
 * ya'ni kontentga ixtiyoriy ikon nomi yozib bundle'ni shishirib bo'lmaydi.
 */
/** Mahsulot xususiyatlari uchun ikonlar — yopiq ro'yxat. */
export type FeatureIcon =
  | "zero-gravity"
  | "body-scan"
  | "bluetooth"
  | "heat"
  | "sl-track"
  | "air"
  | "folding"
  | "quiet"
  | "4d";

export type IconName =
  | "shield"
  | "wrench"
  | "credit-card"
  | "truck"
  | "layers"
  | "hand"
  | "headset"
  | "map-pin"
  | "award"
  | "armchair"
  | "sofa"
  | "treadmill"
  | "bike"
  | "elliptical"
  | "vending"
  | "grid"
  | "sparkles";

export type SiteContent = {
  nav: NavItem[];
  hero: HeroSlide[];
  trust: TrustItem[];
  categories: Category[];
  products: Product[];
  advantages: Advantage[];
  about: About;
  partners: Partner[];
  branches: Branch[];
  posts: Post[];
  blog: BlogSection;
  leadTrust: TrustPoint[];
  reviews: Review[];
  faq: FaqItem[];
  contact: SiteContact;
  lead: Lead;
  badges: Badge[];
};
