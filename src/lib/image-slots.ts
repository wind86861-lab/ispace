import { hero } from "@/content/hero";
import { products as seedProducts } from "@/content/products";
import { about } from "@/content/about";
import { partners } from "@/content/partners";
import { lead } from "@/content/lead";
import { blogSection } from "@/content/blog";
import type { LocaleString, Product } from "@/content/types";
import { readCollection } from "@/lib/store";
import type { ImageSlot } from "./image-slot-types";

export type { ImageSlot };
export { slotGroups } from "./image-slot-types";

/**
 * Saytdagi barcha rasm "uyalari" — yagona ro'yxat.
 *
 * U kontent fayllaridan **hosil qilinadi**, qo'lda takrorlanmaydi:
 * yangi mahsulot yoki maqola qo'shilsa, admin sahifasida uning uyasi
 * o'zidan paydo bo'ladi. Yuklash API'si ham faqat shu ro'yxatdagi
 * yo'llarga yozadi — foydalanuvchi kiritgan yo'l hech qachon
 * ishlatilmaydi (path traversal imkonsiz).
 */

const RU = (v: LocaleString) => v.ru;

/**
 * Uyalar ro'yxati kontentdan hosil qilinadi, shuning uchun u ENDI
 * dinamik: mahsulot va kategoriyalar admin omboridan kelishi mumkin.
 * Ilgari bu modul darajasidagi massiv edi — admin yangi mahsulot
 * qo'shganda uning rasm uyalari paydo bo'lmay qolardi.
 */
function build(products: Product[]): ImageSlot[] {
  return [
  ...hero.map((slide, i) => ({
    id: `hero-${slide._id}`,
    group: "Hero",
    label: `${i + 1}-slayd — ${RU(slide.eyebrow)}`,
    path: slide.image.src,
    width: slide.image.width ?? 1600,
    height: slide.image.height ?? 1100,
    hint:
      i === 0
        ? "LCP rasm — eng sifatlisi shu bo'lsin. Chap yarmi tinch bo'lsin: u yerda matn turadi."
        : "Chap yarmi tinch bo'lsin: u yerda matn turadi.",
  })),



  /*
   * Mahsulot sahifasidagi hikoya bloklarining rasmlari.
   *
   * Bu uyalar bo'sh turishi MUMKIN va bu normal holat: rasm yuklanmaguncha
   * blok saytda umuman chizilmaydi (`Media.uploaded`). Ya'ni admin
   * qaysi bloklarni yoqishini o'zi hal qiladi — kodga tegilmaydi.
   */
  ...products.flatMap((p) =>
    (p.story ?? []).flatMap((block) => [
      ...block.media.map((m, i) => ({
        id: `story-${p._id}-${block._id}-${i}`,
        group: "Mahsulot sahifalari",
        label: `${RU(p.title)} — ${block.title ? RU(block.title) : block._id}${block.media.length > 1 ? ` (${i + 1})` : ""}`,
        path: m.src,
        width: m.width ?? 1200,
        height: m.height ?? 900,
        hint: "Yuklanmasa bu blok sahifada ko'rsatilmaydi.",
      })),
      ...(block.thumbs ?? []).map((m, i) => ({
        id: `story-${p._id}-${block._id}-t${i}`,
        group: "Mahsulot sahifalari",
        label: `${RU(p.title)} — ${block.title ? RU(block.title) : block._id}, kichik ${i + 1}`,
        path: m.src,
        width: m.width ?? 400,
        height: m.height ?? 300,
        hint: "Ixtiyoriy. Yuklanganlari qatorda ko'rinadi.",
      })),
    ]),
  ),

  ...about.gallery.map((m, i) => ({
    id: `about-gallery-${i}`,
    group: "Kompaniya",
    label: `Galereya ${i + 1} — ${RU(m.alt)}`,
    path: m.src,
    width: m.width ?? 600,
    height: m.height ?? 600,
  })),
  ...(about.certificates ?? []).map((m, i) => ({
    id: `about-cert-${i}`,
    group: "Kompaniya",
    label: `Sertifikat ${i + 1}`,
    path: m.src,
    width: m.width ?? 600,
    height: m.height ?? 800,
    hint: "Yuklanmasa «О компании» sahifasida ko'rsatilmaydi.",
  })),
  {
    id: "about-video-file",
    group: "Kompaniya",
    kind: "video" as const,
    label: "Video fayl (ixtiyoriy)",
    path: about.video.file?.src ?? "/videos/about-tour.mp4",
    width: 1920,
    height: 1080,
    hint: "MP4 yoki WebM, 64 MB gacha. Yuklansa YouTube o‘rniga shu video ochiladi. Kodek H.264 + AAC bo‘lsin — u barcha brauzerda o‘ynaydi.",
  },
  {
    id: "about-video-poster",
    group: "Kompaniya",
    label: "Video muqovasi",
    path: about.video.poster.src,
    width: about.video.poster.width ?? 1280,
    height: about.video.poster.height ?? 720,
    hint: "16:9. Ustida oltin «play» tugmasi turadi.",
  },



  ...partners.map((p) => ({
    id: `partner-${p._id}`,
    group: "Hamkorlar",
    label: p.name,
    path: p.logo,
    width: 300,
    height: 80,
    hint: "Logo. SVG afzal; PNG bo'lsa shaffof fonli bo'lsin.",
  })),

  {
    id: "lead-image",
    group: "Bosh sahifa",
    label: "«Не нашли нужный товар?» — fon rasmi",
    path: lead.image.src,
    width: lead.image.width ?? 2400,
    height: lead.image.height ?? 1600,
    hint: "Butun ekranni egallaydi va scroll'da mixlanib turadi — shuning uchun KENG rasm kerak. Kreslo o'ng tomonda bo'lsin: chap yarmida matn turadi. Fon och bo'lsa yaxshi.",
  },
  {
    id: "blog-banner",
    group: "Blog",
    kind: "media" as const,
    label: "«/blog» sahifasi banneri",
    path: blogSection.banner.src,
    width: blogSection.banner.width ?? 2400,
    height: blogSection.banner.height ?? 800,
    hint: "RASM yoki VIDEO. Sahifa kengligini egallaydi (3:1). Ixtiyoriy — yuklanmasa banner umuman chizilmaydi. Video bo'lsa ovozsiz, uzluksiz aylanib turadi.",
  },
  {
    id: "blog-bg",
    group: "Blog",
    kind: "media" as const,
    label: "«Блог iSpace» — bo'lim foni",
    path: blogSection.background.src,
    width: blogSection.background.width ?? 2400,
    height: blogSection.background.height ?? 1600,
    hint: "Ixtiyoriy. Butun ekranni egallaydi va scroll'da mixlanib turadi, shuning uchun KENG rasm kerak. Ustiga och parda tushadi — foto sokin faktura bo'lib qoladi. Yuklanmasa bo'lim hozirgidek tekis krem fonda qoladi.",
  },
  {
    id: "brand-og",
    group: "Brend",
    label: "Ijtimoiy tarmoq muqovasi (OG)",
    path: "/images/og.jpg",
    width: 1200,
    height: 630,
  },
  {
    id: "brand-logo",
    group: "Brend",
    label: "Logotip (JSON-LD uchun)",
    path: "/images/logo.png",
    width: 512,
    height: 512,
  },
  ];
}

/** Joriy uyalar — har chaqiruvda ombordan o'qiladi. */
export async function getImageSlots(): Promise<ImageSlot[]> {
  // Faqat mahsulotlar kerak: qolgan uyalar statik kontentdan.
  const products = await readCollection("products", seedProducts);
  return build(products);
}

/** Uya `id` bo'yicha — yozish yo'lini tekshirishda ishlatiladi. */
export async function getSlotById(id: string): Promise<ImageSlot | undefined> {
  return (await getImageSlots()).find((s) => s.id === id);
}


