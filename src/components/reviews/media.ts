import type { Media, Review } from "@/content/types";
import { isVideoSrc } from "@/components/ui/SmartMedia";

/**
 * Sharhga biriktirilgan bitta media.
 *
 * Uch tur bir xil ro'yxatda yuradi, chunki foydalanuvchi uchun ular
 * bitta narsa — "sharh ostidagi material". Farqi faqat chizishda:
 * fotoga `next/image`, yuklangan faylga `<video>`, havolaga YouTube
 * pleyeri kerak.
 */
export type ViewerItem =
  | { kind: "photo"; media: Media }
  /** Admin yuklagan MP4/WebM — o'z serverimizda. */
  | { kind: "video"; media: Media }
  | { kind: "youtube"; youtubeId: string };

/**
 * Sharhdan media ro'yxatini yig'adi.
 *
 * Bitta joyda: karta muqovasi, modal va to'liq ekran ko'ruvchi shu
 * ro'yxatning aynan bir xil tartibiga tayanadi. Ilgari har biri
 * `photos` ni o'zicha filtrlardi va `youtubeId` ni unutib qo'yish
 * oson edi.
 *
 * `review.youtubeId` — ESKI maydon: sharhga bitta video biriktirish
 * uchun edi. U saqlanadi (mavjud yozuvlar buzilmasin), lekin yangi
 * material har bir media uyasining o'zida beriladi.
 */
export function reviewMedia(review: Review): ViewerItem[] {
  const items: ViewerItem[] = [];

  if (review.youtubeId)
    items.push({ kind: "youtube", youtubeId: review.youtubeId });

  for (const media of review.photos ?? []) {
    if (media.youtubeId) {
      items.push({ kind: "youtube", youtubeId: media.youtubeId });
      continue;
    }
    /*
     * Yuklanmagan uya TASHLANADI. Sayt bo'ylab bir xil qoida: bo'sh
     * o'rindosh ramka foydalanuvchiga ko'rsatilmaydi.
     */
    if (media.uploaded !== true) continue;
    items.push(
      isVideoSrc(media.src)
        ? { kind: "video", media }
        : { kind: "photo", media },
    );
  }

  return items;
}

/** Ro'yxatdagi videolar soni — karta belgisi va yorliqlar uchun. */
export const countVideos = (items: ViewerItem[]) =>
  items.filter((i) => i.kind !== "photo").length;

/** Ro'yxatdagi fotolar soni. */
export const countPhotos = (items: ViewerItem[]) =>
  items.filter((i) => i.kind === "photo").length;
