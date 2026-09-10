import { test, expect } from "@playwright/test";

const USERNAME = "admin";
const PASSWORD = "playwright-test-parol";
const HEADERS = { "x-requested-with": "ispace-admin" };

test.describe.configure({ mode: "serial" });

/**
 * Buyurtma oqimi: saytdan yuboriladi → admin panelida ko'rinadi.
 *
 * Ilgari «Оформить заказ» tugmasida `onClick` umuman yo'q edi va
 * formalar arizani konsolga yozardi — hech bir buyurtma hech qayerga
 * yetib bormasdi.
 */
test("savat buyurtmasi adminga tushadi va o‘chiriladi", async ({ page, request }) => {
  const phone = `+99890${Math.floor(1000000 + Math.random() * 8999999)}`;

  // 1 — mahsulotni savatga qo'shamiz, savat O'ZI ochilishi kerak
  await page.goto("/ru/catalog/takumi");
  await page.getByRole("button", { name: /в корзину/i }).first().click();

  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();

  // 2 — «Оформить заказ» forma ochadi
  await drawer.getByRole("button", { name: "Оформить заказ" }).click();
  await drawer.getByLabel("Ваше имя").fill("E2E Mijoz");
  await drawer.getByLabel("Номер телефона").fill(phone);
  await drawer.getByRole("button", { name: "Отправить заказ" }).click();

  await expect(drawer.getByText("Заказ принят")).toBeVisible({ timeout: 10_000 });

  // 3 — adminda ko'rinadi, narx SERVERDAN hisoblangan
  const login = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  const list = await request.get("/api/admin/orders");
  expect(list.ok(), await list.text()).toBeTruthy();

  const items = (await list.json()).items as {
    _id: string;
    phone: string;
    name: string;
    total: number;
    status: string;
    items?: { qty: number }[];
  }[];
  const mine = items.find((o) => o.phone === phone);

  expect(mine, "buyurtma ro‘yxatda bo‘lishi kerak").toBeTruthy();
  expect(mine!.name).toBe("E2E Mijoz");
  expect(mine!.status).toBe("new");
  expect(mine!.total).toBeGreaterThan(0);
  expect(mine!.items?.length).toBe(1);

  // 4 — holat o'zgaradi
  const patched = await request.patch("/api/admin/orders", {
    headers: HEADERS,
    data: { id: mine!._id, status: "called" },
  });
  expect(patched.ok(), await patched.text()).toBeTruthy();

  // 5 — tozalaymiz
  const del = await request.delete(`/api/admin/orders?id=${encodeURIComponent(mine!._id)}`, {
    headers: HEADERS,
  });
  expect(del.ok(), await del.text()).toBeTruthy();
});

/** Narx MIJOZDAN olinmasligi kerak — u katalogdan qayta hisoblanadi. */
test("yuborilgan narx e’tiborga olinmaydi", async ({ request }) => {
  const phone = `+99891${Math.floor(1000000 + Math.random() * 8999999)}`;

  const res = await request.post("/api/order", {
    data: {
      source: "cart",
      name: "Narx sinovi",
      phone,
      items: [{ productId: "p-takumi", qty: 2, price: 1 }],
      total: 2,
    },
  });
  expect(res.ok(), await res.text()).toBeTruthy();

  await request.post("/api/admin/session", { data: { username: USERNAME, password: PASSWORD } });
  const items = (await (await request.get("/api/admin/orders")).json()).items as {
    _id: string;
    phone: string;
    total: number;
  }[];
  const mine = items.find((o) => o.phone === phone)!;

  expect(mine.total).toBeGreaterThan(1000);

  await request.delete(`/api/admin/orders?id=${encodeURIComponent(mine._id)}`, {
    headers: HEADERS,
  });
});

/** Sessiyasiz admin ro'yxati berilmasligi kerak. */
test("buyurtmalar ro‘yxati himoyalangan", async ({ playwright }) => {
  const anon = await playwright.request.newContext();
  const res = await anon.get("/api/admin/orders");
  expect(res.status()).toBe(401);
  await anon.dispose();
});
