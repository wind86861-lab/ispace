import { test, expect } from "@playwright/test";

/**
 * Harakat — barcha sahifalarda.
 *
 * Mavjud smoke testi faqat bosh sahifani tekshirardi, holbuki katalog,
 * blog, «О компании» va filiallar sahifalari ham o'sha `Reveal` tizimida
 * ishlaydi. Bir sahifada to'g'ri sozlangan effekt boshqasida element
 * ochilmay qolishiga olib kelishi mumkin — masalan karusel ichidagi
 * karta gorizontal kesilgani uchun kuzatuvchiga "chiqib ketdi" bo'lib
 * ko'rinadi.
 */
const PAGES = [
  "/ru/about",
  "/ru/branches",
  "/ru/blog",
  "/ru/blog/how-to-choose-a-massage-chair",
  "/ru/catalog",
  "/ru/catalog/crown-2",
];

for (const url of PAGES) {
  test(`${url} — ko‘rinadigan hech bir element ochilmay qolmaydi`, async ({ page }) => {
    await page.goto(url);
    await page.waitForTimeout(1000);

    const height = await page.evaluate(() => document.body.scrollHeight);
    const stuck: string[] = [];

    for (let y = 0; y < height; y += 900) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(1500);

      stuck.push(
        ...(await page.evaluate(() => {
          // Faqat HAQIQATAN ko'rinadigan elementlar: markazi ekranda va
          // o'sha nuqtada aynan o'zi turadi (kesilmagan, yopilmagan).
          const visible = (e: Element) => {
            const b = e.getBoundingClientRect();
            if (b.top < 20 || b.bottom > innerHeight - 20 || b.width === 0) return false;
            const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
            return !!hit && (e.contains(hit) || hit.contains(e));
          };

          return Array.from(
            document.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal-group] > *"),
          )
            .filter(visible)
            .filter((e) => {
              const cs = getComputedStyle(e);
              // `blur(0…)` va `inset(0 0 0…)` — bu allaqachon OCHILGAN holat.
              return (
                Number(cs.opacity) < 0.98 ||
                (cs.filter !== "none" && !/blur\(0/.test(cs.filter)) ||
                (cs.clipPath !== "none" && !/inset\(0(px)? 0(px)? 0(px)?/.test(cs.clipPath))
              );
            })
            .map((e) => (e.textContent || e.tagName).trim().slice(0, 40));
        })),
      );
    }

    expect(stuck, `ochilmay qolgan: ${[...new Set(stuck)].join(" | ")}`).toEqual([]);
  });
}

/**
 * Katalog kartasi bosh sahifadagi karta bilan bir xil "his" berishi
 * kerak: kursor ustiga kelganda 3D egilish. Bir mahsulot ikki joyda
 * turlicha ko'rinmasin.
 */
test("katalog kartasi kursorga egiladi va reduced-motion’da egilmaydi", async ({ browser }) => {
  for (const [mode, shouldTilt] of [
    ["no-preference", true],
    ["reduce", false],
  ] as const) {
    const context = await browser.newContext({ reducedMotion: mode });
    const page = await context.newPage();

    await page.goto("/ru/catalog");
    await page.waitForTimeout(1200);

    const card = page.locator("main article").first();
    const box = await card.boundingBox();
    expect(box, "katalogda karta topilmadi").not.toBeNull();

    await page.mouse.move(box!.x + box!.width * 0.15, box!.y + box!.height * 0.15);
    await page.waitForTimeout(500);

    const transform = await card.evaluate((e) => getComputedStyle(e).transform);
    if (shouldTilt) {
      expect(transform, "kursor ostida egilish kutilgan").not.toBe("none");
    } else {
      expect(transform, "reduced-motion’da egilish bo‘lmasin").toBe("none");
    }

    await context.close();
  }
});
