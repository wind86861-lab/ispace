import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

// `ADMIN_USERNAME` test serverida berilmagan — sukut qiymati "admin".
const USERNAME = "admin";
const PASSWORD = "playwright-test-parol";
const HEADERS = { "x-requested-with": "ispace-admin" };

test.describe.configure({ mode: "serial" });

test("admin sessiyasiz kirish sahifasiga yo‘naltiradi", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("button", { name: "Kirish" })).toBeVisible();
});

test("API sessiyasiz 401 qaytaradi", async ({ request }) => {
  const res = await request.get("/api/admin/images", { headers: HEADERS });
  expect(res.status()).toBe(401);
});

test("mutatsiya CSRF sarlavhasisiz rad etiladi", async ({ request }) => {
  // Avval sessiya olamiz
  const login = await request.post("/api/admin/session", { data: { username: USERNAME, password: PASSWORD } });
  expect(login.ok()).toBeTruthy();

  const res = await request.delete("/api/admin/images?id=brand-og");
  expect(res.status()).toBe(403);
});

test("noto‘g‘ri parol rad etiladi va xato ko‘rsatiladi", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', "notogri-parol");
  await page.click('button[type="submit"]');

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("to‘g‘ri parol bilan admin ochiladi va chiqish ishlaydi", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  // `/admin` — kirish nuqtasi, u birinchi bo'limga yuboradi.
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole("heading", { name: "Mahsulotlar", level: 1 })).toBeVisible();

  // Bo'limlar orasida yurish
  await page.getByRole("link", { name: "Rasmlar" }).click();
  await expect(page).toHaveURL(/\/admin\/images$/);
  await expect(page.getByText(/almashtirilgan/)).toBeVisible({ timeout: 20000 });

  await page.getByRole("button", { name: "Chiqish" }).first().click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  // Cookie o'chgan — himoyalangan sahifa yana yopiq
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("yuklangan rasm saytda darrov ko‘rinadi", async ({ page, request }) => {
  const login = await request.post("/api/admin/session", { data: { username: USERNAME, password: PASSWORD } });
  expect(login.ok()).toBeTruthy();

  // 1x1 shaffof PNG — eng kichik haqiqiy rasm
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  const upload = await request.post("/api/admin/images", {
    headers: HEADERS,
    multipart: {
      id: "hero-hero-premium",
      file: { name: "test.png", mimeType: "image/png", buffer: png },
    },
  });
  expect(upload.ok()).toBeTruthy();
  const { url } = await upload.json();

  // Yangi yo'l mazmun xeshi bilan — ya'ni hech qanday kesh eskisini bermaydi
  expect(url).toMatch(/^\/media\/hero-hero-premium\.[0-9a-f]{10}\.webp$/);

  // Fayl haqiqatan beriladi. `public/` da bo'lganda `next start` uni
  // bermas edi (build vaqtida ro'yxatga olingan) — shuning uchun alohida
  // tekshiruv.
  const raw = await request.get(url);
  expect(raw.status(), `${url} berilishi kerak`).toBe(200);
  expect(raw.headers()["content-type"]).toContain("image/");

  // Sayt darrov yangi yo'lni ko'rsatadi (statik sahifa qayta hosil qilingan)
  await page.goto("/ru");
  const html = await page.content();
  expect(html).toContain(encodeURIComponent(url).replace(/%2F/g, "%2F"));

  // Tozalaymiz
  const restore = await request.delete("/api/admin/images?id=hero-hero-premium", {
    headers: HEADERS,
  });
  expect(restore.ok()).toBeTruthy();
});

test("oq fonli mahsulot fotosi kesilmaydi", async ({ request }) => {
  const login = await request.post("/api/admin/session", { data: { username: USERNAME, password: PASSWORD } });
  expect(login.ok()).toBeTruthy();

  // Oq fonda to'q buyum — mahsulot fotosining imitatsiyasi.
  const upload = await request.post("/api/admin/images", {
    headers: HEADERS,
    multipart: {
      id: "about-video-poster",
      file: {
        name: "product.png",
        mimeType: "image/png",
        buffer: readFileSync("tests/fixtures/product-on-white.png"),
      },
    },
  });
  expect(upload.ok(), await upload.text()).toBeTruthy();
  const data = await upload.json();

  // Oq chekkali rasm `contain` deb aniqlanadi — ya'ni kesilmaydi.
  expect(data.fit).toBe("contain");

  const restore = await request.delete("/api/admin/images?id=about-video-poster", {
    headers: HEADERS,
  });
  expect(restore.ok()).toBeTruthy();
});
