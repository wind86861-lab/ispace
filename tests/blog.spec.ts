import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const USERNAME = "admin";
const PASSWORD = "playwright-test-parol";
const HEADERS = { "x-requested-with": "ispace-admin" };

test.describe.configure({ mode: "serial" });

/** Ro'yxat sahifasi uchala tilda ochiladi va maqolaga o'tadi. */
test("blog uchala tilda ochiladi va maqolaga o‘tadi", async ({ page }) => {
  for (const [locale, title] of [
    ["ru", "Блог iSpace"],
    ["uz", "iSpace blogi"],
    ["en", "iSpace blog"],
  ] as const) {
    await page.goto(`/${locale}/blog`);
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();

    await page.locator("main a[href*='/blog/']").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/blog/[a-z0-9-]+$`));
    /*
     * Sarlavha bo'yicha tekshiramiz, DOM tuzilishi bo'yicha emas.
     * `article p` ga bog'lanish mo'rt edi: boshqa test faylidagi
     * `revalidatePath` sahifani qayta chizganda tekshiruv o'sha lahzaga
     * tushib qolardi. `h1` esa sahifaning o'zi bilan birga keladi.
     */
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

/** Maqola matni o'z tilida chiqadi. */
test("maqola matni tanlangan tilda chiqadi", async ({ page }) => {
  for (const [locale, text] of [
    ["ru", "Тип направляющей"],
    ["uz", "Yo‘naltirgich turi"],
    ["en", "Track type"],
  ] as const) {
    await page.goto(`/${locale}/blog/how-to-choose-a-massage-chair`);
    await expect(page.getByRole("heading", { name: text })).toBeVisible();
  }
});

/**
 * Maqoladagi rasm bloki — mahsulot hikoyasidagi qoida bilan bir xil:
 * rasm yuklanmaguncha blok chizilmaydi.
 */
test("maqoladagi rasm bloki faqat rasm yuklanganda ko‘rinadi", async ({ page, request }) => {
  const login = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  const base = {
    slug: "e2e-blog-image",
    category: "tips",
    title: { ru: "E2E запись", uz: "E2E yozuv", en: "E2E entry" },
    excerpt: { ru: "Проверка.", uz: "Tekshiruv.", en: "Check." },
    cover: {
      src: "/images/blog/care.webp",
      alt: { ru: "a", uz: "b", en: "c" },
      width: 800,
      height: 500,
    },
    publishedAt: "2026-06-01",
    readingMinutes: 2,
  };
  const alt = { ru: "E2E картинка", uz: "E2E rasm", en: "E2E picture" };

  /*
   * 1 — statik (yuklanmagan) yo'l bilan: blok chizilmasligi kerak.
   * Aynan shu qoida uchun `Media.uploaded` bor.
   */
  const withStatic = await request.post("/api/admin/content/posts", {
    headers: HEADERS,
    data: {
      ...base,
      body: [{ kind: "image", media: { src: "/images/blog/nope.webp", alt } }],
    },
  });
  expect(withStatic.status(), await withStatic.text()).toBe(201);
  const id1 = (await withStatic.json()).item._id as string;

  await page.goto("/ru/blog/e2e-blog-image");
  await expect(page.getByText("E2E картинка")).toHaveCount(0);

  await request.delete(`/api/admin/content/posts?id=${encodeURIComponent(id1)}`, {
    headers: HEADERS,
  });

  // 2 — haqiqatan yuklangan rasm bilan: blok ko'rinadi.
  const uploaded = await request.post("/api/admin/upload", {
    headers: HEADERS,
    multipart: {
      prefix: "post-body",
      file: {
        name: "b.png",
        mimeType: "image/png",
        buffer: readFileSync("tests/fixtures/product-on-white.png"),
      },
    },
  });
  expect(uploaded.ok(), await uploaded.text()).toBeTruthy();
  const { url } = await uploaded.json();

  const withUpload = await request.post("/api/admin/content/posts", {
    headers: HEADERS,
    data: { ...base, body: [{ kind: "image", media: { src: url, alt } }] },
  });
  expect(withUpload.status(), await withUpload.text()).toBe(201);
  const id2 = (await withUpload.json()).item._id as string;

  try {
    await page.goto("/ru/blog/e2e-blog-image");
    await expect(page.getByText("E2E картинка").first()).toBeVisible();
  } finally {
    const removed = await request.delete(
      `/api/admin/content/posts?id=${encodeURIComponent(id2)}`,
      { headers: HEADERS },
    );
    expect(removed.ok()).toBeTruthy();
  }
});

/** Validatsiya: noma'lum blok turi va noto'g'ri sana rad etiladi. */
test("maqola validatsiyasi noto‘g‘ri ma’lumotni rad etadi", async ({ request }) => {
  const login = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  const base = {
    slug: "e2e-invalid",
    category: "tips",
    title: { ru: "a", uz: "b", en: "c" },
    excerpt: { ru: "a", uz: "b", en: "c" },
    cover: { src: "/x.webp", alt: { ru: "a", uz: "b", en: "c" } },
    publishedAt: "2026-01-01",
    readingMinutes: 2,
  };

  const badBlock = await request.post("/api/admin/content/posts", {
    headers: HEADERS,
    data: { ...base, body: [{ kind: "video" }] },
  });
  expect(badBlock.status()).toBe(400);

  const badDate = await request.post("/api/admin/content/posts", {
    headers: HEADERS,
    data: { ...base, publishedAt: "01.01.2026" },
  });
  expect(badDate.status()).toBe(400);
});
