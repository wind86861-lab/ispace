import { test, expect } from "@playwright/test";

/** Rejadagi §12 — oltita smoke stsenariy. */

test.describe("1 · prefiksiz manzil tilni aniqlab yo'naltiradi", () => {
  // next-intl `Accept-Language` ni hurmat qiladi — bu foydalanuvchi
  // tanloviga bo'ysunish, shuning uchun ataylab yoqilgan.
  for (const [browserLocale, expected] of [
    ["ru-RU", "ru"],
    ["uz-UZ", "uz"],
    ["en-US", "en"],
    // Hech biri mos kelmasa — defaultLocale.
    ["de-DE", "ru"],
  ] as const) {
    test(`${browserLocale} → /${expected}`, async ({ browser }) => {
      // `locale` Playwright'da `Accept-Language` sarlavhasini ham belgilaydi.
      const context = await browser.newContext({ locale: browserLocale });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page).toHaveURL(new RegExp(`/${expected}$`));
      await context.close();
    });
  }
});

test("2 · uchala til ochiladi va lang atributi to'g'ri", async ({ page }) => {
  for (const [locale, lang, heading] of [
    ["ru", "ru-UZ", "Выберите свою категорию"],
    ["uz", "uz-UZ", "O‘z toifangizni tanlang"],
    ["en", "en-US", "Choose your category"],
  ] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    // Sarlavha `aria-label` da butun turadi (§5) — matn bo'linmagan.
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

test("3 · savat paneli ochiladi va Esc bilan yopiladi", async ({ page }) => {
  await page.goto("/ru");
  await page.getByRole("button", { name: /Корзина/ }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Корзина пока пуста")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("4 · savatga qo'shish hisoblagichni oshiradi", async ({ page }) => {
  await page.goto("/ru");
  await page.getByRole("button", { name: "В корзину" }).first().click();
  await expect(page.getByRole("button", { name: /Корзина, товаров: 1/ })).toBeVisible();
});

test("5 · FAQ akkordeoni ochiladi va yopiladi", async ({ page }) => {
  await page.goto("/ru");
  const trigger = page.getByRole("button", { name: /Какая гарантия/ });
  await trigger.scrollIntoViewIfNeeded();

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/официальная гарантия 3 года/)).toBeVisible();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("6 · forma validatsiyasi xatoni ko'rsatadi", async ({ page }) => {
  await page.goto("/ru");
  await page.locator("#lead").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Связаться с нами" }).click();

  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("7 · reduced-motion'da hech qanday kontent yashirin qolmaydi", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ru");

  // Sahifani oxirigacha aylantiramiz — barcha `inView` bloklar chizilsin.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);

  const invisible = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-group] > *"));
    return nodes.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length;
  });
  expect(invisible).toBe(0);

  // §14 — preloader ham umuman ko'rsatilmaydi.
  await expect(page.locator(".preloader")).toHaveCount(0);
});

test("8 · til almashtirgich sahifada qoladi", async ({ page }) => {
  await page.goto("/ru");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { name: "Choose your category" })).toBeVisible();
});

test("9 · kirish animatsiyalari ikkala yo‘nalishda ham qayta ishlaydi", async ({ page }) => {
  await page.goto("/ru");
  await page.waitForTimeout(1200);

  const target = page.locator("#faq [data-reveal]").first();

  const revealed = () => target.evaluate((el) => el.hasAttribute("data-revealed"));
  const opacity = () => target.evaluate((el) => Number(getComputedStyle(el).opacity));

  // 1) Bo'limga tushamiz — ochilishi kerak
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  expect(await revealed(), "bo‘limga kelganda ochilishi kerak").toBe(true);
  expect(await opacity()).toBeGreaterThan(0.9);

  // 2) Sahifa boshiga qaytamiz — element ekrandan chiqadi va tiklanadi
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1400);
  expect(await revealed(), "ekrandan chiqqach holat tiklanishi kerak").toBe(false);
  expect(await opacity()).toBeLessThan(0.1);

  // 3) Yana tushamiz — animatsiya QAYTA ishlashi kerak
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  expect(await revealed(), "qaytib kelganda yana ochilishi kerak").toBe(true);
  expect(await opacity()).toBeGreaterThan(0.9);
});

test("10 · counter har safar qaytadan sanaydi", async ({ page }) => {
  await page.goto("/ru");
  await page.waitForTimeout(1000);

  // Yorliq bo'yicha topamiz va uning yonidagi raqamni o'qiymiz — raqamning
  // o'zi bo'yicha qidirish mumkin emas, chunki u sanoq davomida o'zgaradi.
  const value = page
    .getByText("довольных клиентов", { exact: true })
    .locator("xpath=preceding-sibling::p[1]");

  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2600);
  await expect(value).toHaveText(/50\s?000\+/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);

  // Qaytib kelamiz: sanoq boshidan ketishi kerak, ya'ni darrov o'lchaganda
  // qiymat yakuniy sondan kichik bo'ladi.
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const midway = (await value.textContent())?.trim();
  expect(midway, `sanoq qaytadan boshlanishi kerak, ko‘rilgan: ${midway}`).not.toMatch(/50\s?000\+/);

  await page.waitForTimeout(2400);
  await expect(value).toHaveText(/50\s?000\+/);
});

test("11 · scroll bilan yoziladigan matn reduced-motion'da to‘liq ko‘rinadi", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", locale: "ru-RU" });
  const page = await context.newPage();
  await page.goto("/ru");

  // "О компании" dan yuqorida turamiz: animatsiya ishlasa, so'zlar xira bo'lardi.
  const top = await page.evaluate(
    () => document.querySelector("#about")!.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((v) => window.scrollTo(0, v), top - 750);
  await page.waitForTimeout(900);

  const state = await page.evaluate(() => {
    const words = Array.from(document.querySelectorAll<HTMLElement>(".scroll-word"));
    const paras = Array.from(document.querySelectorAll<HTMLElement>("#about p[aria-label]"));
    return {
      splitWords: words.length,
      hiddenParas: paras.filter((p) => Number(getComputedStyle(p).opacity) < 0.99).length,
    };
  });

  // Harakat o'chirilganda matn umuman bo'linmasligi kerak…
  expect(state.splitWords, "reduced-motion'da matn bo‘linmasligi kerak").toBe(0);
  // …va paragraflar to'liq ko'rinishi kerak.
  expect(state.hiddenParas, "paragraflar to‘liq ko‘rinishi kerak").toBe(0);

  await context.close();
});

test("12 · scroll bilan yoziladigan matn odatiy rejimda to‘liq ochiladi", async ({ page }) => {
  await page.goto("/ru");
  await page.locator("#about").scrollIntoViewIfNeeded();
  // Scrub scroll pozitsiyasiga bog'langan — bo'limdan o'tib ketamiz.
  await page.evaluate(() => {
    const el = document.querySelector("#about")!;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.clientHeight);
  });
  await page.waitForTimeout(1200);

  const faded = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>("#about .scroll-word")).filter(
        (w) => Number(getComputedStyle(w).opacity) < 0.9,
      ).length,
  );
  expect(faded, "bo‘limdan o‘tgach hamma so‘z to‘liq ko‘rinishi kerak").toBe(0);
});

test("13 · ko‘rinadigan hech bir element ochilmay qolmaydi", async ({ page }) => {
  await page.goto("/ru");
  await page.waitForTimeout(1000);

  const stuck: string[] = [];

  for (let y = 0; y < 11000; y += 900) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1600);

    const found = await page.evaluate(() => {
      // Faqat HAQIQATAN ko'rinadigan elementlar: markazi ekranda va
      // o'sha nuqtada aynan o'zi turadi (kesilmagan, yopilmagan).
      const visible = (e: Element) => {
        const b = e.getBoundingClientRect();
        if (b.top < 20 || b.bottom > innerHeight - 20 || b.width === 0) return false;
        const x = b.left + b.width / 2;
        const yy = b.top + b.height / 2;
        if (x < 0 || x > innerWidth) return false;
        const hit = document.elementFromPoint(x, yy);
        return !!hit && (e.contains(hit) || hit.contains(e));
      };

      return Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal-group] > *"),
      )
        .filter(visible)
        .filter((e) => {
          const cs = getComputedStyle(e);
          const f = cs.filter;
          const c = cs.clipPath;
          return (
            Number(cs.opacity) < 0.98 ||
            (f !== "none" && !/blur\(0/.test(f)) ||
            (c !== "none" && !/inset\(0(px)? 0(px)? 0(px)?/.test(c))
          );
        })
        .map((e) => (e.textContent || "").trim().slice(0, 40));
    });

    stuck.push(...found);
  }

  expect(stuck, `ochilmay qolgan: ${stuck.join(" | ")}`).toEqual([]);
});
