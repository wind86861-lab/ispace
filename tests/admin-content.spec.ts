import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const USERNAME = "admin";
const PASSWORD = "playwright-test-parol";
const HEADERS = { "x-requested-with": "ispace-admin" };

test.describe.configure({ mode: "serial" });

/**
 * Kontent boshqaruvi: qo'shish → saytda ko'rinish → o'chirish.
 *
 * Bu yerda "sayt" ham tekshiriladi, faqat API emas: mahsulot omborga
 * yozilgani bilan katalogga chiqmasligi mumkin (kesh, statik generatsiya,
 * override qatlami) — ya'ni haqiqiy natija shu.
 */
test("login nom va parolni birga tekshiradi", async ({ request }) => {
  const wrongUser = await request.post("/api/admin/session", {
    data: { username: "notogri", password: PASSWORD },
  });
  expect(wrongUser.status()).toBe(401);

  const wrongPass = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: "notogri-parol" },
  });
  expect(wrongPass.status()).toBe(401);

  const ok = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(ok.ok()).toBeTruthy();
});

test("mahsulot qo‘shiladi, saytda uch tilda chiqadi va o‘chiriladi", async ({ page, request }) => {
  const login = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  const body = {
    slug: "e2e-test-chair",
    title: { ru: "E2E кресло", uz: "E2E kreslo", en: "E2E chair" },
    category: "massage-chairs",
    price: 4_200_000,
    rank: 1,
    images: [
      {
        src: "/images/products/crown-2.webp",
        alt: { ru: "E2E", uz: "E2E", en: "E2E" },
        width: 900,
        height: 900,
      },
    ],
    features: [{ icon: "heat", label: { ru: "Прогрев", uz: "Isitish", en: "Heating" } }],
  };

  // CSRF sarlavhasisiz o'tmasin.
  const noCsrf = await request.post("/api/admin/content/products", { data: body });
  expect(noCsrf.status()).toBe(403);

  // Uchala til to'ldirilmagan bo'lsa qabul qilinmasin.
  const invalid = await request.post("/api/admin/content/products", {
    headers: HEADERS,
    data: { ...body, slug: "e2e-bad", title: { ru: "A", uz: "", en: "C" } },
  });
  expect(invalid.status()).toBe(400);

  const created = await request.post("/api/admin/content/products", {
    headers: HEADERS,
    data: body,
  });
  expect(created.status(), await created.text()).toBe(201);
  const id = (await created.json()).item._id as string;

  try {
    // Katalogda va o'z sahifasida — har tilda o'sha tildagi nom bilan.
    for (const [locale, title] of [
      ["ru", "E2E кресло"],
      ["uz", "E2E kreslo"],
      ["en", "E2E chair"],
    ] as const) {
      await page.goto(`/${locale}/catalog/e2e-test-chair`);
      await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
    }

    await page.goto("/ru/catalog");
    await expect(page.getByText("E2E кресло")).toBeVisible();

    /*
     * Mahsulot rasmi endi `/admin/images` uyasidan emas, muharrir
     * ichidagi yuklash marshrutidan keladi. Shuning uchun uya emas,
     * o'sha marshrut tekshiriladi: u `/media/...` URL qaytarishi va
     * fayl haqiqatan berilishi kerak.
     */
    const uploaded = await request.post("/api/admin/upload", {
      headers: HEADERS,
      multipart: {
        prefix: "product",
        file: {
          name: "p.png",
          mimeType: "image/png",
          buffer: readFileSync("tests/fixtures/product-on-white.png"),
        },
      },
    });
    expect(uploaded.ok(), await uploaded.text()).toBeTruthy();
    const { url } = await uploaded.json();
    expect(url).toMatch(/^\/media\/product\.[0-9a-f]{10}\.webp$/);

    const served = await request.get(url);
    expect(served.status()).toBe(200);
  } finally {
    const removed = await request.delete(
      `/api/admin/content/products?id=${encodeURIComponent(id)}`,
      { headers: HEADERS },
    );
    expect(removed.ok()).toBeTruthy();
  }

  await page.goto("/ru/catalog");
  await expect(page.getByText("E2E кресло")).toHaveCount(0);
});
