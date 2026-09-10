import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Order } from "@/content/types";

/**
 * Buyurtmalar va murojaatlar ombori.
 *
 * Nega `store.ts` dan alohida: u ADMIN tahrirlaydigan kontent uchun va
 * "fayl yo'q bo'lsa urug' qiymati" qoidasiga tayanadi. Buyurtmalar esa
 * teskari — ularni SAYT yozadi, admin faqat o'qiydi, va bo'sh ro'yxat
 * mutlaqo normal holat. Urug' bo'lishi ham mumkin emas: soxta
 * buyurtma menejerni chalg'itardi.
 *
 * Fayl `data/` ning ILDIZIDA: `data/content/` ni deploy skripti
 * serverdan tortib oladi va build uchun ishlatadi, buyurtmalarni esa
 * ishlab chiquvchining mashinasiga tushirish shart emas.
 */
const FILE = path.join(process.cwd(), "data", "orders.json");

/** Diskda saqlanadigan eng ko'p yozuv — fayl cheksiz o'smasin. */
const MAX = 2000;

export async function readOrders(): Promise<Order[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(FILE, "utf8"));
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    // Fayl hali yo'q — hali birorta buyurtma kelmagan.
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  /*
   * Yozish atomik: avval vaqtinchalik faylga, so'ng `rename`. Jarayon
   * yozish o'rtasida to'xtasa ham yarim yozilgan JSON qolmaydi —
   * buyurtmalar ro'yxati yo'qolmaydi.
   */
  await writeFile(tmp, JSON.stringify(orders, null, 2) + "\n");
  await rename(tmp, FILE);
}

/** Yangi murojaatni ro'yxat BOSHIGA qo'shadi — yangilari tepada. */
export async function addOrder(order: Order): Promise<void> {
  const all = await readOrders();
  await writeOrders([order, ...all].slice(0, MAX));
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<Order, "status">>,
): Promise<Order | null> {
  const all = await readOrders();
  const i = all.findIndex((o) => o._id === id);
  if (i < 0) return null;

  const next = { ...all[i], ...patch };
  all[i] = next;
  await writeOrders(all);
  return next;
}

export async function deleteOrder(id: string): Promise<void> {
  const all = await readOrders();
  await writeOrders(all.filter((o) => o._id !== id));
}
