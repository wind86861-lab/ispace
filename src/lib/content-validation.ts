import "server-only";
import { parseYouTubeId } from "./youtube";
import { MAX_BADGES } from "./limits";
import { locales } from "@/i18n/routing";
import type {
  Advantage,
  Badge,
  Branch,
  Category,
  FaqItem,
  LocaleString,
  Media,
  Post,
  PostBlock,
  Product,
  Review,
  TrustPoint,
} from "@/content/types";

/**
 * Admin yuborgan ma'lumotni tekshirish.
 *
 * Bu qatlam **majburiy**: kolleksiya JSON fayl bo'lib diskda yotadi va
 * to'g'ridan-to'g'ri saytga chiziladi. Tekshirilmagan maydon shu yerdan
 * sahifaga tushadi, ya'ni bu ishonch chegarasi.
 *
 * Yondashuv — "ruxsat etilganlar ro'yxati": natija HAR DOIM shu yerda
 * qayta yig'iladi, kirish obyekti nusxalanmaydi. Shunda mijoz yuborgan
 * ortiqcha maydon (masalan `uploaded: true`) omborga umuman tushmaydi.
 */

export class ValidationError extends Error {}

const fail = (msg: string): never => {
  throw new ValidationError(msg);
};

const str = (v: unknown, field: string, max = 400): string => {
  if (typeof v !== "string") fail(`${field}: matn kutilgan`);
  const t = (v as string).trim();
  if (t.length === 0) fail(`${field}: bo‘sh bo‘lmasin`);
  if (t.length > max) fail(`${field}: ${max} belgidan uzun`);
  return t;
};

const optionalStr = (v: unknown, field: string, max = 400): string | undefined =>
  v == null || v === "" ? undefined : str(v, field, max);

const num = (v: unknown, field: string, min = 0, max = 1e12): number => {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) fail(`${field}: son kutilgan`);
  if ((n as number) < min || (n as number) > max) fail(`${field}: chegaradan tashqarida`);
  return n as number;
};

/** `slug` — manzilga tushadi, shuning uchun qat'iy cheklanadi. */
const slug = (v: unknown, field: string): string => {
  const t = str(v, field, 80).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t))
    fail(`${field}: faqat lotin harflari, raqam va defis (masalan "crown-2")`);
  return t;
};

/** Uchala til ham to'ldirilishi shart — sayt uch tilda ishlaydi. */
export function localeString(v: unknown, field: string, max = 400): LocaleString {
  if (!v || typeof v !== "object") fail(`${field}: uch tilli obyekt kutilgan`);
  const src = v as Record<string, unknown>;
  const out = {} as LocaleString;
  for (const l of locales) out[l] = str(src[l], `${field}.${l}`, max);
  return out;
}

/**
 * Rasm.
 *
 * `alt` endi ADMINDAN so'ralmaydi — u yozuvning o'z sarlavhasidan
 * olinadi (`fallbackAlt`). Sabab: alt matn kontent muharririga
 * tushunarsiz maydon bo'lib, amalda yo bo'sh qolardi, yo sarlavhaning
 * nusxasi bo'lardi. Avtomatik olingan alt ikkinchisiga teng, lekin
 * hech qachon bo'sh bo'lmaydi va admin vaqtini olmaydi.
 */
function media(v: unknown, field: string, fallbackAlt?: LocaleString): Media {
  if (!v || typeof v !== "object") fail(`${field}: rasm obyekti kutilgan`);
  const m = v as Record<string, unknown>;
  const src = str(m.src, `${field}.src`, 300);
  // Yo'l faqat ichki bo'lsin: tashqi URL kiritish orqali sahifaga begona
  // manba ulash imkoni bo'lmasin.
  if (!src.startsWith("/")) fail(`${field}.src: "/" bilan boshlanishi kerak`);
  if (src.includes("..")) fail(`${field}.src: noto‘g‘ri yo‘l`);

  /*
   * `fail()` ni IFODА sifatida chaqiramiz, alohida `if` da emas:
   * TypeScript `never` qaytaruvchi funksiyani shart ichida chaqirilganda
   * tipni toraytirmaydi, `??` da esa toraytiradi.
   */
  const alt: LocaleString =
    (m.alt && typeof m.alt === "object" && Object.values(m.alt).some((v) => String(v ?? "").trim())
      ? localeString(m.alt, `${field}.alt`, 200)
      : fallbackAlt) ?? fail(`${field}.alt: alt matn aniqlanmadi`);

  return {
    src,
    alt,
    width: m.width == null ? undefined : num(m.width, `${field}.width`, 1, 10000),
    height: m.height == null ? undefined : num(m.height, `${field}.height`, 1, 10000),
    fit: m.fit === "contain" || m.fit === "cover" ? m.fit : undefined,
    bg: typeof m.bg === "string" && /^#[0-9a-fA-F]{3,8}$/.test(m.bg) ? m.bg : undefined,
    /*
     * `/media/` — bu yo'l faqat yuklash marshrutidan chiqadi, ya'ni fayl
     * haqiqatan bor. Statik `/images/...` esa o'rindosh bo'lishi mumkin.
     * Shu farq mahsulot hikoyasi va maqoladagi rasm bloklari uchun hal
     * qiluvchi: ular faqat `uploaded` bo'lganda chiziladi.
     *
     * Mijoz bu bayroqni O'ZI yubora olmaydi — u shu yerda yo'ldan
     * hisoblanadi.
     */
    uploaded: src.startsWith("/media/") ? true : undefined,
  };
}

const FEATURE_ICONS = [
  "zero-gravity", "body-scan", "bluetooth", "heat",
  "sl-track", "air", "folding", "quiet",
] as const;

export function validateProduct(input: unknown, existing?: Product): Product {
  if (!input || typeof input !== "object") fail("Mahsulot obyekti kutilgan");
  const p = input as Record<string, unknown>;

  const images = Array.isArray(p.images) ? p.images : [];
  if (images.length === 0) fail("Kamida bitta rasm kerak");

  const features = Array.isArray(p.features) ? p.features : [];
  const title = localeString(p.title, "title", 200);

  return {
    // `_id` hech qachon mijozdan olinmaydi: mavjud yozuvda o'zgarmaydi,
    // yangisida server yaratadi.
    _id: existing?._id ?? `p-${slug(p.slug, "slug")}-${Date.now().toString(36)}`,
    slug: slug(p.slug, "slug"),
    title,
    category: slug(p.category, "category"),
    price: num(p.price, "price", 0),
    oldPrice: p.oldPrice == null || p.oldPrice === "" ? undefined : num(p.oldPrice, "oldPrice", 0),
    currency: "UZS",
    isNew: Boolean(p.isNew),
    featured: Boolean(p.featured),
    rank: num(p.rank ?? existing?.rank ?? 100, "rank", 0, 10000),
    images: images.map((m, i) => media(m, `images[${i}]`, title)),
    /*
     * Ko'pi bilan TO'RTTA. Chegara interfeysda ham bor, lekin u yagona
     * himoya bo'la olmaydi: so'rov to'g'ridan-to'g'ri ham yuborilishi
     * mumkin, kartada esa beshinchi nishon narx blokining ustiga
     * chiqib ketardi.
     */
    badgeIds: Array.isArray(p.badgeIds)
      ? p.badgeIds.slice(0, MAX_BADGES).map((b, i) => str(b, `badgeIds[${i}]`, 60))
      : undefined,
    features: features.map((f, i) => {
      const o = (f ?? {}) as Record<string, unknown>;
      const icon = String(o.icon);
      if (!FEATURE_ICONS.includes(icon as (typeof FEATURE_ICONS)[number]))
        fail(`features[${i}].icon: noma’lum ikon`);
      return {
        icon: icon as Product["features"][number]["icon"],
        label: localeString(o.label, `features[${i}].label`, 60),
      };
    }),

    /*
     * Savdo maydonchalari. Havola faqat `https://` — kontentga
     * `javascript:` yoki `data:` sxemasi tushib qolmasin.
     *
     * Ikoni yo'q yozuv ham saqlanadi: u sahifada matnli tugma bo'lib
     * chiqadi, ya'ni logotip topilmaguncha havola ishlab turaveradi.
     */
    marketplaces: Array.isArray(p.marketplaces)
      ? p.marketplaces.map((raw, i) => {
          const m = (raw ?? {}) as Record<string, unknown>;
          const name = str(m.name, `marketplaces[${i}].name`, 60);
          const url = str(m.url, `marketplaces[${i}].url`, 500);
          if (!/^https:\/\//.test(url)) fail(`marketplaces[${i}].url: https:// bilan boshlansin`);
          const alt: LocaleString = { ru: name, uz: name };
          return {
            _id: typeof m._id === "string" && m._id ? m._id : `mp-${Date.now().toString(36)}-${i}`,
            name,
            url,
            image:
              m.image && typeof m.image === "object" &&
              String((m.image as Record<string, unknown>).src ?? "").trim()
                ? media(m.image, `marketplaces[${i}].image`, alt)
                : { src: "", alt },
          };
        })
      : undefined,

    brand: optionalStr(p.brand, "brand", 60),
    rating: p.rating == null || p.rating === "" ? undefined : num(p.rating, "rating", 0, 5),
    reviewCount:
      p.reviewCount == null || p.reviewCount === ""
        ? undefined
        : num(p.reviewCount, "reviewCount", 0, 1e6),
    inStock: p.inStock == null ? true : Boolean(p.inStock),
    description: p.description == null ? undefined : localeString(p.description, "description", 2000),
    delivery: p.delivery == null ? undefined : localeString(p.delivery, "delivery", 2000),
    specs: Array.isArray(p.specs)
      ? p.specs.map((r, i) => {
          const o = (r ?? {}) as Record<string, unknown>;
          return {
            label: localeString(o.label, `specs[${i}].label`, 100),
            value: localeString(o.value, `specs[${i}].value`, 200),
          };
        })
      : undefined,

    // Bu maydonlarni forma tahrirlamaydi — mavjud qiymat saqlanadi.
    colors: existing?.colors,
    bundles: existing?.bundles,
    /*
     * Pastki bo'limlar (hikoya) endi ADMINDAN keladi.
     *
     * Ilgari bu yerda `existing?.story` turardi — ya'ni maydon
     * kontentdan olinardi va muharrirdagi har qanday o'zgarish
     * jimgina yo'qolardi. Muharrir qo'shilgach bu xato bo'lib qoldi.
     *
     * Media BO'SH bo'lishi mumkin: admin blokni yaratib, rasmni
     * keyinroq yuklashi normal holat. Bo'sh media saytda chizilmaydi
     * (`Media.uploaded`), shuning uchun yarim tayyor blok ko'rinmaydi.
     */
    story: Array.isArray(p.story)
      ? p.story.map((raw, i) => {
          const b = (raw ?? {}) as Record<string, unknown>;
          const layout = b.layout === "split" || b.layout === "pair" ? b.layout : "wide";
          const soft = (v: unknown, field: string) =>
            v && typeof v === "object" && Object.values(v).some((x) => String(x ?? "").trim())
              ? localeString(v, field, 2000)
              : undefined;

          const title = soft(b.title, `story[${i}].title`);
          const alt: LocaleString = title ?? localeString(p.title, "title", 200);
          const rawMedia = Array.isArray(b.media) ? b.media : [];

          return {
            _id: typeof b._id === "string" && b._id ? b._id : `st-${Date.now().toString(36)}-${i}`,
            layout,
            title,
            text: soft(b.text, `story[${i}].text`),
            media: rawMedia.map((m, k) => {
              const src = String((m as Record<string, unknown>)?.src ?? "").trim();
              return src
                ? media(m, `story[${i}].media[${k}]`, alt)
                : { src: "", alt };
            }),
            thumbs: Array.isArray(b.thumbs)
              ? b.thumbs
                  .map((m, k) => {
                    const src = String((m as Record<string, unknown>)?.src ?? "").trim();
                    return src ? media(m, `story[${i}].thumbs[${k}]`, alt) : { src: "", alt };
                  })
              : undefined,
            reverse: Boolean(b.reverse),
            /*
             * Havola SHU YERDA ID ga aylantiriladi. Noto'g'ri havola
             * `undefined` bo'ladi va blok oddiy media bloki bo'lib
             * qolaveradi — saqlash rad etilmaydi, chunki admin uni
             * keyinroq to'g'rilashi mumkin.
             */
            youtubeId: parseYouTubeId(typeof b.youtubeId === "string" ? b.youtubeId : "") ?? undefined,
          };
        })
      : existing?.story,
  };
}

export function validateCategory(input: unknown, existing?: Category): Category {
  if (!input || typeof input !== "object") fail("Kategoriya obyekti kutilgan");
  const c = input as Record<string, unknown>;
  const title = localeString(c.title, "title", 120);

  return {
    /*
     * Ikon IXTIYORIY: noma'lum qiymat jimgina tashlanadi va katalog
     * filtri zaxira belgini chizadi — saqlash rad etilmaydi.
     */
    icon: ICON_NAMES.includes(String(c.icon) as (typeof ICON_NAMES)[number])
      ? (String(c.icon) as Category["icon"])
      : undefined,
    _id: existing?._id ?? `cat-${slug(c.slug, "slug")}`,
    slug: slug(c.slug, "slug"),
    title,
    text: c.text == null || c.text === "" ? undefined : localeString(c.text, "text", 300),
    image: media(c.image, "image", title),
    featured: Boolean(c.featured),
    wide: Boolean(c.wide),
  };
}

const POST_CATEGORIES = ["massage", "reviews", "health", "tips", "news"] as const;

/** ISO sana: `2026-05-15`. */
const isoDate = (v: unknown, field: string): string => {
  const t = str(v, field, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t) || Number.isNaN(Date.parse(t)))
    fail(`${field}: sana YYYY-MM-DD ko‘rinishida bo‘lsin`);
  return t;
};

/**
 * Maqola tanasi.
 *
 * Har blok tipi bo'yicha qayta yig'iladi — noma'lum `kind` yoki ortiqcha
 * maydon omborga tushmaydi. Shu sabab sahifaga hech qachon kutilmagan
 * shakldagi blok kelmaydi va chizuvchi komponent har doim to'liq
 * ma'lumot bilan ishlaydi.
 */
function postBlock(v: unknown, field: string, fallbackAlt: LocaleString): PostBlock {
  if (!v || typeof v !== "object") fail(`${field}: blok obyekti kutilgan`);
  const b = v as Record<string, unknown>;

  switch (b.kind) {
    case "paragraph":
      return { kind: "paragraph", text: localeString(b.text, `${field}.text`, 3000) };
    case "heading":
      return { kind: "heading", text: localeString(b.text, `${field}.text`, 200) };
    case "quote":
      return {
        kind: "quote",
        text: localeString(b.text, `${field}.text`, 1000),
        author: b.author == null ? undefined : localeString(b.author, `${field}.author`, 120),
      };
    case "list": {
      const items = Array.isArray(b.items) ? b.items : fail(`${field}.items: ro‘yxat kutilgan`);
      if (items.length === 0) fail(`${field}.items: bo‘sh bo‘lmasin`);
      return { kind: "list", items: items.map((x, i) => localeString(x, `${field}.items[${i}]`, 500)) };
    }
    case "image":
      return { kind: "image", media: media(b.media, `${field}.media`, fallbackAlt) };
    default:
      return fail(`${field}.kind: noma’lum blok turi`);
  }
}

export function validatePost(input: unknown, existing?: Post): Post {
  if (!input || typeof input !== "object") fail("Maqola obyekti kutilgan");
  const p = input as Record<string, unknown>;

  const category = String(p.category);
  if (!POST_CATEGORIES.includes(category as (typeof POST_CATEGORIES)[number]))
    fail("category: noma’lum rukn");

  const title = localeString(p.title, "title", 200);

  return {
    _id: existing?._id ?? `po-${slug(p.slug, "slug")}-${Date.now().toString(36)}`,
    slug: slug(p.slug, "slug"),
    category: category as Post["category"],
    title,
    excerpt: localeString(p.excerpt, "excerpt", 500),
    cover: media(p.cover, "cover", title),
    publishedAt: isoDate(p.publishedAt, "publishedAt"),
    readingMinutes: num(p.readingMinutes, "readingMinutes", 1, 120),
    author: p.author == null ? undefined : localeString(p.author, "author", 120),
    featured: Boolean(p.featured),
    body: Array.isArray(p.body) ? p.body.map((b, i) => postBlock(b, `body[${i}]`, title)) : undefined,
  };
}

/** YouTube ID — 11 belgili, faqat xavfsiz alifbo. */
const youtubeId = (v: unknown, field: string): string => {
  const t = str(v, field, 20);
  if (!/^[A-Za-z0-9_-]{11}$/.test(t)) fail(`${field}: YouTube ID 11 belgidan iborat bo‘lsin`);
  return t;
};

export function validateReview(input: unknown, existing?: Review): Review {
  if (!input || typeof input !== "object") fail("Sharh obyekti kutilgan");
  const r = input as Record<string, unknown>;

  const rating = num(r.rating, "rating", 1, 5);
  if (!Number.isInteger(rating)) fail("rating: butun son bo‘lsin");

  const photos = Array.isArray(r.photos) ? r.photos : [];

  return {
    _id: existing?._id ?? `rv-${Date.now().toString(36)}`,
    author: localeString(r.author, "author", 120),
    text: localeString(r.text, "text", 2000),
    rating: rating as Review["rating"],
    publishedAt: isoDate(r.publishedAt, "publishedAt"),
    photos:
      photos.length > 0
        ? photos.map((m, i) => media(m, `photos[${i}]`, localeString(r.author, "author", 120)))
        : undefined,
    youtubeId:
      r.youtubeId == null || r.youtubeId === "" ? undefined : youtubeId(r.youtubeId, "youtubeId"),
  };
}

const ICON_NAMES = [
  "shield", "wrench", "credit-card", "truck",
  "layers", "hand", "headset", "map-pin", "award", "sparkles",
  "armchair", "sofa", "treadmill", "bike", "elliptical", "vending", "grid",
] as const;

export function validateBranch(input: unknown, existing?: Branch): Branch {
  if (!input || typeof input !== "object") fail("Filial obyekti kutilgan");
  const b = input as Record<string, unknown>;
  const geo = (b.geo ?? {}) as Record<string, unknown>;

  const mapsUrl = str(b.mapsUrl, "mapsUrl", 500);
  // Havola faqat tashqi xarita xizmatiga — `javascript:` kabi sxemalar emas.
  if (!/^https:\/\//.test(mapsUrl)) fail("mapsUrl: https:// bilan boshlansin");

  return {
    _id: existing?._id ?? `br-${Date.now().toString(36)}`,
    // `mapId` xaritadagi nuqta kalitiga bog'langan — o'zgartirilmaydi.
    mapId: existing?.mapId ?? str(b.mapId, "mapId", 60),
    city: localeString(b.city, "city", 80),
    district: localeString(b.district, "district", 120),
    address: localeString(b.address, "address", 300),
    phone: str(b.phone, "phone", 40),
    hours: localeString(b.hours, "hours", 120),
    mapsUrl,
    geo: {
      lat: num(geo.lat, "geo.lat", -90, 90),
      lng: num(geo.lng, "geo.lng", -180, 180),
    },
    photo:
      b.photo == null || !(b.photo as Record<string, unknown>).src
        ? undefined
        : media(b.photo, "photo", localeString(b.city, "city", 80)),
    note: b.note == null || b.note === "" ? undefined : localeString(b.note, "note", 300),
  };
}

export function validateFaqItem(input: unknown, existing?: FaqItem): FaqItem {
  if (!input || typeof input !== "object") fail("Savol obyekti kutilgan");
  const f = input as Record<string, unknown>;
  return {
    _id: existing?._id ?? `fq-${Date.now().toString(36)}`,
    question: localeString(f.question, "question", 300),
    answer: localeString(f.answer, "answer", 2000),
  };
}

export function validateAdvantage(input: unknown, existing?: Advantage): Advantage {
  if (!input || typeof input !== "object") fail("Afzallik obyekti kutilgan");
  const a = input as Record<string, unknown>;
  const icon = String(a.icon);
  if (!ICON_NAMES.includes(icon as (typeof ICON_NAMES)[number])) fail("icon: noma’lum ikon");

  return {
    _id: existing?._id ?? `ad-${Date.now().toString(36)}`,
    icon: icon as Advantage["icon"],
    title: localeString(a.title, "title", 160),
    text: localeString(a.text, "text", 600),
  };
}

export function validateTrustPoint(input: unknown, existing?: TrustPoint): TrustPoint {
  if (!input || typeof input !== "object") fail("Ishonch nuqtasi obyekti kutilgan");
  const t = input as Record<string, unknown>;
  const icon = String(t.icon);
  if (!ICON_NAMES.includes(icon as (typeof ICON_NAMES)[number])) fail("icon: noma’lum ikon");

  return {
    _id: existing?._id ?? `tp-${Date.now().toString(36)}`,
    icon: icon as TrustPoint["icon"],
    /*
     * Uzunlik ataylab qisqa: chiziqda uchta juftlik YONMA-YON turadi.
     * Uzun matn u yerda qatorni ikkiga bo'lib, chiziq balandligini
     * ikki barobar oshiradi.
     */
    title: localeString(t.title, "title", 60),
    text: localeString(t.text, "text", 60),
    rank: num(t.rank ?? existing?.rank ?? 100, "rank", 0, 10000),
  };
}

export function validateBadge(input: unknown, existing?: Badge): Badge {
  if (!input || typeof input !== "object") fail("Belgi obyekti kutilgan");
  const b = input as Record<string, unknown>;

  /*
   * `label` bo'sh bo'lishi MUMKIN: ba'zi nishonlarda faqat ikon va
   * ostidagi kichik yozuv bo'ladi (masalan "подогрев"). Shuning uchun
   * ikkalasi ham ixtiyoriy, lekin hech bo'lmasa bittasi kerak.
   */
  const soft = (v: unknown, field: string) =>
    v && typeof v === "object" && Object.values(v).some((x) => String(x ?? "").trim())
      ? localeString(v, field, 40)
      : undefined;

  const label = soft(b.label, "label");
  const sublabel = soft(b.sublabel, "sublabel");
  const anyLabel: LocaleString = label ?? sublabel ?? fail("label yoki sublabel to‘ldirilsin");

  return {
    _id: existing?._id ?? `bg-${Date.now().toString(36)}`,
    label: label ?? { ru: "", uz: "" },
    sublabel,
    rank: num(b.rank ?? existing?.rank ?? 100, "rank", 0, 10000),
    image: media(b.image, "image", anyLabel),
  };
}
