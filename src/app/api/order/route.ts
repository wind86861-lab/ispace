import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { Order, OrderItem, Product } from "@/content/types";
import { addOrder } from "@/lib/orders";
import { readCollection } from "@/lib/store";
import { products as seedProducts } from "@/content/products";
import { normalizePhone } from "@/lib/validation";

/**
 * Saytdan kelgan murojaat: savat buyurtmasi yoki forma arizasi.
 *
 * Bu marshrut OMMAVIY — admin sessiyasi talab qilinmaydi, chunki
 * buyurtmani mijoz yuboradi. Shu sabab himoya boshqacha qurilgan:
 *
 *  · maydonlar qat'iy tekshiriladi va kesiladi;
 *  · NARX mijozdan olinmaydi — u katalogdan qayta hisoblanadi, aks
 *    holda kim xohlasa 1 so'mlik buyurtma yubora olardi;
 *  · bitta IP dan qisqa vaqtda ko'p so'rov o'tmaydi.
 */

/** Bir IP uchun oyna va undagi eng ko'p so'rov. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/*
 * Oddiy xotiradagi hisoblagich.
 *
 * Nega Redis emas: sayt bitta pm2 jarayonida ishlaydi va bu yerdagi
 * maqsad — tasodifiy takror yuborish va sodda skriptlarni to'sish,
 * taqsimlangan hujumdan himoya emas. Jarayon qayta ishga tushsa
 * hisob nolga qaytadi va bu maqbul.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);

  /* Xotira cheksiz o'smasin — eskirgan kalitlar vaqti-vaqti bilan tozalanadi. */
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return list.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const SOURCES: Order["source"][] = ["cart", "consultation", "lead", "test-drive"];

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Juda ko‘p so‘rov. Bir daqiqadan so‘ng urinib ko‘ring." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Noto‘g‘ri so‘rov" }, { status: 400 });

  const phoneRaw = str(body.phone, 40);
  const digits = phoneRaw.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    return NextResponse.json({ error: "Telefon raqami noto‘g‘ri" }, { status: 400 });
  }

  const source = SOURCES.includes(body.source as Order["source"])
    ? (body.source as Order["source"])
    : "lead";

  /*
   * Ism savat buyurtmasida MAJBURIY: menejer kimga qo'ng'iroq
   * qilishini bilishi kerak. Qidiruv formasida esa u so'ralmaydi va
   * bo'sh qolishi normal.
   */
  const name = str(body.name, 80);
  if (source === "cart" && name.length < 2) {
    return NextResponse.json({ error: "Ismni kiriting" }, { status: 400 });
  }

  let items: OrderItem[] | undefined;
  let total = 0;

  if (Array.isArray(body.items) && body.items.length > 0) {
    /*
     * Narx KATALOGDAN olinadi, so'rovdan emas. Mijoz yuborgan yagona
     * ishonchli ma'lumot — qaysi mahsulot va nechta.
     */
    const products = await readCollection<Product>("products", seedProducts);

    items = body.items
      .slice(0, 50)
      .map((raw) => {
        const o = (raw ?? {}) as Record<string, unknown>;
        const product = products.find((p) => p._id === o.productId);
        if (!product) return null;

        const qty = Math.min(99, Math.max(1, Math.round(Number(o.qty) || 1)));
        return {
          productId: product._id,
          title: product.title.ru,
          qty,
          price: product.price,
        };
      })
      .filter((x): x is OrderItem => x !== null);

    if (items.length === 0) {
      return NextResponse.json({ error: "Savat bo‘sh" }, { status: 400 });
    }
    total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  } else if (source === "cart") {
    return NextResponse.json({ error: "Savat bo‘sh" }, { status: 400 });
  }

  const order: Order = {
    _id: randomUUID(),
    createdAt: new Date().toISOString(),
    source,
    name,
    phone: normalizePhone(phoneRaw),
    comment: str(body.comment, 1000) || undefined,
    items,
    total,
    status: "new",
  };

  await addOrder(order);

  /* Mijozga faqat tasdiq qaytadi — ichki ma'lumot chiqarilmaydi. */
  return NextResponse.json({ ok: true });
}
