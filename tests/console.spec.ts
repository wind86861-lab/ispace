import { test, expect } from "@playwright/test";

/** Hydration va boshqa konsol xatolari — sifat darvozasi. */
test("konsolda xato yo'q", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

  await page.goto("/ru", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);

  // Lead formasi konsolga ataylab `info` yozadi — u hisobga olinmaydi.
  const real = problems.filter((p) => !p.includes("[lead]"));
  expect(real, real.join("\n")).toEqual([]);
});
