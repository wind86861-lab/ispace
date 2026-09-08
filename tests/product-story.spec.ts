import { test, expect } from "@playwright/test";

// `ADMIN_USERNAME` test serverida berilmagan — sukut qiymati "admin".
const USERNAME = "admin";
const PASSWORD = "playwright-test-parol";
const HEADERS = { "x-requested-with": "ispace-admin" };

const PAGE = "/ru/catalog/e2e-story-chair";
const HEADING = "E2E hikoya bloki";

test.describe.configure({ mode: "serial" });

/**
 * Mahsulot sahifasidagi hikoya bloklari.
 *
 * Talab: blok kontentda e'lon qilingan bo'lsa ham, foydalanuvchi uni
 * faqat media YUKLANGANDAN keyin ko'radi. Aks holda sahifada bo'sh
 * o'rindosh ramka turib qolardi.
 *
 * Test uchala holatni bosib o'tadi — yo'q → bor → yana yo'q, chunki
 * "ortga qaytarish" ham talabning bir qismi.
 *
 * Media KONTENT API orqali biriktiriladi, `images` uyalari orqali
 * emas: hikoya bloklari mahsulot formasiga ko'chgan va ularning
 * mediasi endi mahsulot yozuvining o'zida saqlanadi. Eski test
 * `story-*` uyasini so'rardi — u endi mavjud emas.
 */
test("hikoya bloki faqat media yuklanganda ko‘rinadi", async ({ page, request }) => {
  const heading = page.getByRole("heading", { name: HEADING });

  const login = await request.post("/api/admin/session", {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  const base = {
    slug: "e2e-story-chair",
    title: { ru: "E2E hikoya kreslosi", uz: "E2E hikoya kreslosi" },
    category: "massage-chairs",
    price: 3_300_000,
    rank: 1,
    images: [
      {
        src: "/images/products/crown-2.webp",
        alt: { ru: "E2E", uz: "E2E" },
        width: 900,
        height: 900,
      },
    ],
    features: [],
  };

  /*
    Oldingi yiqilgan yurishdan qolgan yozuv tozalanadi.

    Testlar `serial` va bir xil `slug` bilan ishlaydi: yiqilish
    o'chirish qadamiga yetmasdan to'xtatsa, keyingi yurish
    «Bunday slug allaqachon bor» xatosi bilan yiqilardi — ya'ni bitta
    nosozlik butun to'plamni bloklab qo'yardi.
  */
  const existing = await request.get("/api/admin/content/products");
  if (existing.ok()) {
    const items = (await existing.json()).items as { _id: string; slug: string }[];
    for (const item of items.filter((x) => x.slug === base.slug)) {
      await request.delete(
        `/api/admin/content/products?id=${encodeURIComponent(item._id)}`,
        { headers: HEADERS },
      );
    }
  }

  /*
    Blok e'lon qilingan va media YO'LI ko'rsatilgan, lekin fayl hali
    yuklanmagan. Yo'l ataylab mavjud emas: `image-overrides.json` dagi
    yo'l bo'lsa, `applyOverrides` uni almashtirib `uploaded: true`
    qo'yardi va shart buzilardi. Yuklanmagan (`/media/` prefiksi yo'q → `Media.uploaded` yo'q).
    Aynan shu holat yashirilishi kerak: bo'sh uya + matn esa ataylab
    qoldirilgan MATN bloki hisoblanadi va chiziladi.
  */
  const created = await request.post("/api/admin/content/products", {
    headers: HEADERS,
    data: {
      ...base,
      story: [
        {
          layout: "wide",
          title: { ru: HEADING, uz: HEADING },
          media: [{ src: "/images/story/e2e-hali-yuklanmagan.webp", alt: { ru: "E2E", uz: "E2E" } }],
        },
      ],
    },
  });
  expect(created.ok(), await created.text()).toBeTruthy();
  const id = (await created.json()).item._id as string;

  // 1 — media yo'q, blok ham yo'q
  await page.goto(PAGE);
  await expect(heading).toHaveCount(0);

  // 2 — media biriktiramiz va blok paydo bo'ladi
  const withMedia = await request.put(
    `/api/admin/content/products?id=${encodeURIComponent(id)}`,
    {
      headers: HEADERS,
      data: {
        ...base,
        story: [
          {
            layout: "wide",
            title: { ru: HEADING, uz: HEADING },
            /*
              `/media/` prefiksi «yuklangan» degani (`Media.uploaded` ni
              validator shundan qo'yadi) — fayl yuklashni takrorlamasdan
              aynan shu shartni sinaymiz.
            */
            media: [{ src: "/media/e2e-story.webp", alt: { ru: "E2E", uz: "E2E" } }],
          },
        ],
      },
    },
  );
  expect(withMedia.ok(), await withMedia.text()).toBeTruthy();

  await page.goto(PAGE);
  await expect(heading).toBeVisible();

  // 3 — mediani olib tashlaymiz, blok yana yo'qoladi
  const withoutMedia = await request.put(
    `/api/admin/content/products?id=${encodeURIComponent(id)}`,
    {
      headers: HEADERS,
      data: {
        ...base,
        story: [
          {
            layout: "wide",
            title: { ru: HEADING, uz: HEADING },
            media: [{ src: "/images/story/e2e-hali-yuklanmagan.webp", alt: { ru: "E2E", uz: "E2E" } }],
          },
        ],
      },
    },
  );
  expect(withoutMedia.ok(), await withoutMedia.text()).toBeTruthy();

  await page.goto(PAGE);
  await expect(heading).toHaveCount(0);

  const del = await request.delete(
    `/api/admin/content/products?id=${encodeURIComponent(id)}`,
    { headers: HEADERS },
  );
  expect(del.ok(), await del.text()).toBeTruthy();
});

/** Katalog va mahsulot sahifalari ikkala tilda ochiladi. */
test("katalog va mahsulot sahifalari ikkala tilda ishlaydi", async ({ page }) => {
  for (const [locale, catalogTitle] of [
    ["ru", "Каталог товаров"],
    ["uz", "Mahsulotlar katalogi"],
  ] as const) {
    await page.goto(`/${locale}/catalog`);
    await expect(page.getByRole("heading", { name: catalogTitle, level: 1 })).toBeVisible();

    // Kartadan mahsulot sahifasiga o'tish — havola til prefiksini saqlashi kerak.
    await page.locator("main a[href*='/catalog/']").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/catalog/[a-z0-9-]+$`));
    await expect(page.getByRole("button", { name: /savat|корзин|cart/i }).first()).toBeVisible();
  }
});
