import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

// `ADMIN_USERNAME` test serverida berilmagan — sukut qiymati "admin".
const USERNAME = "admin";
const PASSWORD = "playwright-test-parol";
const HEADERS = { "x-requested-with": "ispace-admin" };

/** Sinov bloki va uning uyasi — kontentdan hosil qilingan `id`. */
const SLOT = "story-p-crown-2-modules-0";
const HEADING = "3 независимых массажных модуля";
const PAGE = "/ru/catalog/crown-2";

test.describe.configure({ mode: "serial" });

/**
 * Mahsulot sahifasidagi hikoya bloklari.
 *
 * Talab: blok kontentda oldindan e'lon qilingan bo'lsa ham, foydalanuvchi
 * uni faqat rasm YUKLANGANDAN keyin ko'radi. Aks holda sahifada bo'sh
 * o'rindosh gradientli ramka turib qolardi.
 *
 * Test uchala holatni ham bosib o'tadi — yo'q → bor → yana yo'q, chunki
 * "ortga qaytarish" ham talabning bir qismi: rasm o'chirilsa blok ham
 * yo'qolishi kerak.
 */
test("hikoya bloki faqat rasm yuklanganda ko‘rinadi", async ({ page, request }) => {
  const heading = page.getByRole("heading", { name: HEADING });

  // 1 — dastlab yo'q
  await page.goto(PAGE);
  await expect(heading).toHaveCount(0);

  const login = await request.post("/api/admin/session", { data: { username: USERNAME, password: PASSWORD } });
  expect(login.ok()).toBeTruthy();

  // 2 — yuklaymiz va blok paydo bo'ladi
  const upload = await request.post("/api/admin/images", {
    headers: HEADERS,
    multipart: {
      id: SLOT,
      file: {
        name: "story.png",
        mimeType: "image/png",
        buffer: readFileSync("tests/fixtures/product-on-white.png"),
      },
    },
  });
  expect(upload.ok(), await upload.text()).toBeTruthy();

  await page.goto(PAGE);
  await expect(heading).toBeVisible();

  // Rasmning o'zi ham haqiqatan berilishi kerak, faqat matn emas.
  const src = await page
    .locator(`img[alt*="Crown 2"]`)
    .last()
    .getAttribute("src");
  expect(src, "blok rasmi sahifada bo‘lishi kerak").toBeTruthy();

  // 3 — o'chiramiz va blok yana yo'qoladi
  const del = await request.delete(`/api/admin/images?id=${SLOT}`, { headers: HEADERS });
  expect(del.ok(), await del.text()).toBeTruthy();

  await page.goto(PAGE);
  await expect(heading).toHaveCount(0);
});

/** Katalog va mahsulot sahifalari uchala tilda ochiladi. */
test("katalog va mahsulot sahifalari uchala tilda ishlaydi", async ({ page }) => {
  for (const [locale, catalogTitle] of [
    ["ru", "Каталог товаров"],
    ["uz", "Mahsulotlar katalogi"],
    ["en", "Product catalogue"],
  ] as const) {
    await page.goto(`/${locale}/catalog`);
    await expect(page.getByRole("heading", { name: catalogTitle, level: 1 })).toBeVisible();

    // Kartadan mahsulot sahifasiga o'tish — havola til prefiksini saqlashi kerak.
    await page.locator("main a[href*='/catalog/']").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/catalog/[a-z0-9-]+$`));
    await expect(page.getByRole("button", { name: /savat|корзин|cart/i }).first()).toBeVisible();
  }
});
