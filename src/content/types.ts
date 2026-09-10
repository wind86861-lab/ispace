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
  /**
   * YouTube video ID si — fayl o'rniga.
   *
   * Berilgan bo'lsa galereyada shu video ko'rsatiladi va `src` bo'sh
   * bo'lishi mumkin. Og'ir rolikni serverda saqlash shart emas: 8.7 GB
   * diskda bir nechta video butun joyni yeb qo'yadi, YouTube esa uni
   * turli sifatlarda o'zi beradi.
   *
   * Kontentda HAVOLA emas, ajratib olingan ID saqlanadi — chizishda
   * qayta tahlil qilinmaydi va noto'g'ri havola omborga tushmaydi.
   */
  youtubeId?: string;
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
 * Xususiyat KATALOGI — bir marta yaratiladi, ko'p mahsulotda yoqiladi.
 *
 * Nega alohida kolleksiya: solishtirish jadvali xususiyatlarni YORLIQ
 * matni bo'yicha birlashtiradi. Har mahsulotda yorliq qo'lda yozilsa,
 * «Прогрев спины» va «Прогрев» ikkita alohida qator bo'lib chiqadi va
 * matritsa umuman qurilmaydi. Katalogdan tanlanganda yorliq ta'rifi
 * bitta — qatorlar o'z-o'zidan ustma-ust tushadi.
 *
 * `Badge` bilan bir xil naqsh, farqi: nishonda admin RASM yuklaydi,
 * bu yerda esa ikon koddagi ro'yxatdan tanlanadi (u kartada chiziq
 * bo'lib chiziladi — `DrawIcon`).
 */
export type ProductFeature = {
  _id: string;
  icon: FeatureIcon;
  label: LocaleString;
  /** Ro'yxatdagi tartib. */
  rank: number;
};

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
  /**
   * Xususiyatlar — `ProductFeature._id` lar ro'yxati.
   *
   * `features` maydonini `getContent()` shundan HOSIL QILADI. Ikkalasi
   * ham turgani ataylab: `features` — chizishga tayyor ko'rinish,
   * `featureIds` — haqiqat manbai. Eski yozuvlarda `featureIds` yo'q,
   * o'shanda `features` o'z holicha ishlatiladi.
   */
  featureIds?: string[];

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

/**
 * «Mijozlarga» sahifasidagi bitta xizmat: test-drayv, muddatli to'lov,
 * kafolat, yetkazib berish.
 *
 * Nega alohida kolleksiya, `Advantage` emas: afzallik — bitta jumla,
 * bu esa TO'LIQ bo'lim. Unda o'z sarlavhasi, ro'yxati, raqami va
 * mediasi bor va u sahifada alohida ekran egallaydi.
 */
export type ClientService = {
  _id: string;
  /** Langar (`#test-drive`) — sarlavha ostidagi chiplar shunga o'tadi. */
  slug: string;
  icon: IconName;
  eyebrow: LocaleString;
  title: LocaleString;
  lead: LocaleString;
  /** Bulletlar — har biri `DrawIcon` bilan chizilib chiqadi. */
  points: LocaleString[];
  /**
   * Sahifa boshidagi raqamlar chizig'idagi katak.
   *
   * `value` ATAYLAB tilga bog'liq emas: «500 000», «30%», «1–3».
   * Raqamni tarjima qilib bo'lmaydi, so'z esa `unit` va `label` da.
   */
  stat?: {
    value: string;
    unit?: LocaleString;
    label: LocaleString;
  };
  /**
   * Media uyasi. Yuklanmaguncha CHIZILMAYDI (`Media.uploaded`) — blok
   * o'sha holatda faqat matn bilan, bo'sh ramkasiz chiqadi.
   */
  media: Media;
  /** Yakuniy urg'u qatori — bo'lim oxiridagi bitta jumla. */
  outro?: LocaleString;
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

/**
 * Tarix chizig'idagi bitta nuqta — «2007 · tashkil topdi» kabi.
 *
 * `/about` sahifasida ular gorizontal chiziqda turadi va sahifa
 * aylantirilganda birin-ketin ochiladi. Har nuqtaning o'z rasmi va
 * matni bor; ikkalasi ham admin tomonidan to'ldiriladi.
 */
export type TimelinePoint = {
  _id: string;
  /** Yil — chiziqda shu son ko'rinadi. */
  year: number;
  title: LocaleString;
  text: LocaleString;
  /** Ixtiyoriy: yuklanmagan bo'lsa o'ng tomonda yil raqami chiziladi. */
  image: Media;
  /**
   * Shu yilgi raqamlar — «6 shourum», «50 000+ mijoz» kabi.
   *
   * Ular yildan yilga o'zgaradi: tarixning ma'nosi ham shunda —
   * o'quvchi kompaniya qanday o'sganini raqamlarda ko'radi.
   * Bo'sh qoldirilsa, shu yil uchun raqamlar qatori chizilmaydi.
   */
  stats: Stat[];
};


export type About = {
  /**
   * Sahifa foni — ixtiyoriy.
   *
   * RASM ham, VIDEO ham bo'lishi mumkin (`SmartMedia` kengaytmaga
   * qarab hal qiladi). Yuklanmagan bo'lsa sahifa hozirgidek tekis
   * krem sirtda qoladi — o'rindosh yaratilmagan.
   */
  background?: Media;
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
   * Filial fotosi — ESKI, bitta rasmli maydon.
   *
   * Yangi yozuvlarda `photos` ishlatiladi; bu saqlanadi, chunki
   * mavjud filiallarda rasm aynan shu yerda yotibdi va uni
   * yo'qotmaslik kerak. Chizishda ikkalasi birlashtiriladi.
   */
  photo?: Media;
  /**
   * Filial fotolari — sahifada slayder bo'lib chiqadi.
   *
   * Yuklanmagani chizilmaydi (`Media.uploaded`); bittasi ham
   * yuklanmagan bo'lsa ustun umuman ko'rsatilmaydi va ma'lumot
   * bilan xarita butun kenglikni oladi.
   */
  photos?: Media[];
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
  /**
   * Ombor uchun kalit. Kontakt — YAGONA yozuv, lekin u boshqa
   * kolleksiyalar bilan bir xil mexanizmda saqlanadi (`data/content`),
   * shuning uchun unga ham `_id` kerak.
   */
  _id: string;
  phone: string;
  phoneHref: string;
  email: string;
  /** Ijtimoiy tarmoq havolasi — pastki qismdagi ikon uchun. */
  telegram: string;
  /**
   * Menejer bilan TO'G'RIDAN-TO'G'RI yozishuv havolasi.
   *
   * Mahsulot sahifasidagi «Telegram orqali bog'lanish» tugmasi shunga
   * olib boradi va u hamma mahsulotda bitta. `telegram` dan alohida,
   * chunki pastki qismdagi havola kanal bo'lishi mumkin, bu yerda esa
   * javob beradigan odam kerak. Bo'sh bo'lsa `telegram` ishlatiladi.
   */
  telegramChat?: string;
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
  services: ClientService[];
  productFeatures: ProductFeature[];
  about: About;
  partners: Partner[];
  branches: Branch[];
  posts: Post[];
  blog: BlogSection;
  leadTrust: TrustPoint[];
  timeline: TimelinePoint[];
  reviews: Review[];
  faq: FaqItem[];
  contact: SiteContact;
  lead: Lead;
  badges: Badge[];
};
