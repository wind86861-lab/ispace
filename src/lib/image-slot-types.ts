/**
 * Rasm uyasining shakli va bo'limlar tartibi.
 *
 * Alohida fayl, chunki buni HAM server (`image-slots.ts`), HAM admin
 * sahifasidagi client komponent ishlatadi. `image-slots.ts` ning o'zi
 * ombordan o'qiydi va `server-only` ga bog'liq — uni client'dan import
 * qilib bo'lmaydi.
 */
export type ImageSlot = {
  id: string;
  group: string;
  label: string;
  /**
   * Uyaga qanday fayl tushadi.
   *
   * · `image` (sukut) — faqat rasm; `sharp` uni qayta kodlaydi.
   * · `video` — faqat video; `sharp` tegmaydi, hajm chegarasi kattaroq.
   * · `media` — ADMIN TANLAYDI: rasm ham, video ham bo'ladi. Nima
   *   yuklanganini fayl kengaytmasi aytadi, saytda esa `SmartMedia`
   *   shunga qarab `<video>` yoki `next/image` chizadi.
   */
  kind?: "image" | "video" | "media";
  /** `public/` ichidagi yo'l, boshida `/` bilan. */
  path: string;
  width: number;
  height: number;
  hint?: string;
};

/** Admin sahifasidagi bo'limlar tartibi. */
/**
 * Bo'limlar tartibi.
 *
 * Kategoriya, mahsulot va maqola rasmlari bu yerda YO'Q: ular endi
 * o'z muharrirlarida yuklanadi ("Rasm yuklash" tugmasi). Bu sahifada
 * faqat muharriri bo'lmagan, saytning qat'iy joylaridagi rasmlar
 * qoladi — shuning uchun ro'yxat qisqa va tushunarli.
 */
export const slotGroups = [
  "Hero",
  "Bosh sahifa",
  "Blog",
  "Mahsulot sahifalari",
  "Kompaniya",
  "Hamkorlar",
  "Brend",
] as const;
