import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Admin tahrirlaydigan kontent uchun oddiy fayl ombori.
 *
 * Nega ma'lumotlar bazasi emas: loyihada u yo'q va bitta sayt kontenti
 * uchun kerak ham emas. Rasm override'lari allaqachon shu naqshda
 * (`data/image-overrides.json`) ishlaydi — bu uning umumlashtirilgani.
 *
 * Asosiy qoida: **fayl bo'lmasa, statik kontent ishlatiladi.** Ya'ni
 * admin biror narsani saqlamaguncha sayt bugungidek qoladi va omborni
 * o'chirib tashlash — dastlabki holatga qaytarish demakdir.
 *
 * Yozish atomik: avval vaqtinchalik faylga yoziladi, so'ng `rename`
 * bilan o'rniga qo'yiladi. Shu sabab jarayon yozish o'rtasida to'xtasa
 * ham yarim yozilgan JSON qolmaydi va sayt ishlab turaveradi.
 */
const DIR = path.join(process.cwd(), "data", "content");

export type CollectionName =
  | "products"
  | "categories"
  | "posts"
  | "reviews"
  | "branches"
  | "faq"
  | "advantages"
  | "badges"
  | "leadTrust";

const file = (name: CollectionName) => path.join(DIR, `${name}.json`);

/**
 * Ombordan o'qiydi; fayl yo'q yoki buzuq bo'lsa `seed` qaytadi.
 *
 * Buzuq JSON'da ham sayt yiqilmaydi: bu kontent, kritik ma'lumot emas —
 * eng yomon holatda foydalanuvchi dastlabki ro'yxatni ko'radi.
 */
export async function readCollection<T>(name: CollectionName, seed: T[]): Promise<T[]> {
  try {
    const raw = await readFile(file(name), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as T[];
  } catch {
    return seed;
  }
}

/** Omborga yozadi. Chaqiruvchi keyin `revalidatePath` qilishi kerak. */
export async function writeCollection<T>(name: CollectionName, items: T[]): Promise<void> {
  await mkdir(DIR, { recursive: true });
  const target = file(name);
  const tmp = `${target}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(items, null, 2) + "\n");
  await rename(tmp, target);
}
