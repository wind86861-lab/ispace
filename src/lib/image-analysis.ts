import "server-only";
import sharp from "sharp";

/**
 * Yuklangan rasmning turini aniqlaydi.
 *
 * Ikki xil rasm bir xil muomalani ko'tarmaydi:
 *  · **lifestyle** (xonadagi kreslo) — chekkalari rang-barang; uni kesib
 *    (`cover`) joylashtirsa bo'ladi, chunki kompozitsiya markazda.
 *  · **mahsulot** (oq fonda kesilgan kreslo) — uni kesish mumkin emas:
 *    buyum chetdan kesilib qoladi. Uni butunlay ko'rsatish kerak
 *    (`contain`), va foni sayt foniga qo'shilishi uchun o'sha fon rangi
 *    kerak bo'ladi.
 *
 * Aniqlash usuli: rasm 24×24 ga siqiladi, chekka piksellari o'lchanadi.
 * Chekka bir xil va yorug' bo'lsa — bu mahsulot fotosi.
 */
export type ImageFit = "cover" | "contain";

export type Analysis = {
  fit: ImageFit;
  /** `contain` rejimida orqa fon rangi (`#rrggbb`). */
  bg?: string;
  width: number;
  height: number;
};

const SAMPLE = 24;
/** Chekka piksellarining o'rtacha yorqinligi shu qiymatdan yuqori bo'lsa — yorug' fon. */
const LIGHT_THRESHOLD = 218;
/** Chekka piksellari orasidagi maksimal tarqalish (bir xillik mezoni). */
const MAX_SPREAD = 26;

export async function analyzeImage(input: Buffer): Promise<Analysis> {
  const meta = await sharp(input).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const { data } = await sharp(input)
    .flatten({ background: "#ffffff" }) // shaffof PNG ham oq fon deb qaraladi
    .resize(SAMPLE, SAMPLE, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = (x: number, y: number) => {
    const i = (y * SAMPLE + x) * 3;
    return [data[i], data[i + 1], data[i + 2]] as const;
  };

  const border: (readonly [number, number, number])[] = [];
  for (let i = 0; i < SAMPLE; i++) {
    border.push(px(i, 0), px(i, SAMPLE - 1), px(0, i), px(SAMPLE - 1, i));
  }

  const lum = (p: readonly [number, number, number]) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  const lums = border.map(lum);
  const mean = lums.reduce((s, v) => s + v, 0) / lums.length;
  const spread = Math.sqrt(lums.reduce((s, v) => s + (v - mean) ** 2, 0) / lums.length);

  if (mean >= LIGHT_THRESHOLD && spread <= MAX_SPREAD) {
    // Fon rangi — chekka piksellarining o'rtachasi.
    const avg = [0, 1, 2].map((c) =>
      Math.round(border.reduce((s, p) => s + p[c], 0) / border.length),
    );
    const bg = `#${avg.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    return { fit: "contain", bg, width, height };
  }

  return { fit: "cover", width, height };
}
