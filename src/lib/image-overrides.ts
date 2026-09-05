import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Admin orqali yuklangan rasmlar.
 *
 * Kalit — kontentdagi **asl** yo'l, qiymat — yuklangan faylning yo'li.
 * Yuklangan fayl nomida mazmun xeshi bo'ladi (`...a1b2c3d4.webp`), ya'ni
 * har yangi rasm — yangi URL.
 *
 * Nega shunday: `next/image` optimizatori natijani URL bo'yicha keshlaydi
 * va bu kesh xotirada ham turadi — fayl mazmunini o'zgartirsangiz, u eski
 * nusxani qaytaraveradi (`X-Nextjs-Cache: HIT`, ETag o'zgarmaydi). Faylni
 * o'chirish yordam bermaydi. Yagona ishonchli yo'l — URL ni o'zgartirish;
 * shunda brauzer, optimizator va CDN keshi ham o'z-o'zidan chetlab o'tiladi.
 */
export type ImageOverride = {
  url: string;
  /**
   * `cover` — rasm maydonni to'ldiradi (kerak bo'lsa kesiladi);
   * `contain` — rasm butunlay ko'rinadi, kesilmaydi.
   * Yuklashda avtomatik aniqlanadi: oq fonli mahsulot fotosi kesilmaydi.
   */
  fit?: "cover" | "contain";
  /** `contain` uchun orqa fon rangi — rasmning o'z fonidan olinadi. */
  bg?: string;
};

/** Kalit — kontentdagi asl yo'l. Eski format (oddiy satr) ham o'qiladi. */
export type ImageOverrides = Record<string, ImageOverride | string>;

const normalize = (v: ImageOverride | string): ImageOverride =>
  typeof v === "string" ? { url: v } : v;

export const OVERRIDES_FILE = path.join(process.cwd(), "data", "image-overrides.json");

export async function readOverrides(): Promise<ImageOverrides> {
  try {
    return JSON.parse(await readFile(OVERRIDES_FILE, "utf8")) as ImageOverrides;
  } catch {
    // Fayl hali yo'q — hech narsa almashtirilmagan.
    return {};
  }
}

/**
 * Kontent daraxtidagi barcha `src` maydonlarini almashtiradi.
 * Nusxa qaytaradi — asl kontent obyektlari o'zgarmaydi.
 */
export function applyOverrides<T>(value: T, overrides: ImageOverrides): T {
  if (Object.keys(overrides).length === 0) return value;

  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== "object") return node;

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const hit = (k === "src" || k === "logo") && typeof v === "string" ? overrides[v] : undefined;

      if (hit) {
        const o = normalize(hit);
        out[k] = o.url;
        // `fit`/`bg` ni o'sha obyektga qo'shamiz: `Media` ularni ixtiyoriy
        // maydon sifatida ko'radi, komponentlar esa shunga qarab chizadi.
        if (o.fit) out.fit = o.fit;
        if (o.bg) out.bg = o.bg;
        /*
         * Rasm HAQIQATAN yuklanganini belgilaymiz. Mahsulot sahifasidagi
         * hikoya bloklari shunga qarab chiziladi: yuklanmagan bo'lsa blok
         * umuman ko'rsatilmaydi va foydalanuvchi bo'sh o'rindosh gradientni
         * ko'rmaydi. Buni faqat shu yerdan bilish mumkin — kontentdagi yo'l
         * o'rindoshniki bilan bir xil ko'rinadi.
         */
        if (k === "src") out.uploaded = true;
      } else {
        out[k] = walk(v);
      }
    }
    return out;
  };

  return walk(value) as T;
}
