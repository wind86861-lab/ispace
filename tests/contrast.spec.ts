import { test, expect } from "@playwright/test";

/**
 * Matn kontrasti — o'lchab, taxmin qilmasdan.
 *
 * Lighthouse a11y bu xatolarni TOPA OLMAYDI: u faqat e'lon qilingan CSS
 * ranglarini solishtiradi. Foto ustidagi matn yoki yarim-shaffof sirt
 * ostidan o'tayotgan to'q bo'lim uning nazaridan chetda qoladi — sayt
 * 100 ball olib turib ham kategoriya sarlavhalari 1.35:1 da edi.
 *
 * Shuning uchun bu yerda HAQIQIY piksellar o'lchanadi: matn vaqtincha
 * shaffof qilinadi, ekran olinadi va matn turgan to'rtburchakdagi fon
 * piksellari bo'yicha kontrast hisoblanadi.
 */

/** WCAG 2.1 nisbiy yorug'lik. */
function luminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: number, b: number) {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Kategoriya kartalari — eng nozik joy: matn FOTO ustida turadi, ya'ni
 * fon kontentga bog'liq va oldindan noma'lum. `card-scrim` aynan shuni
 * kafolatlash uchun bor.
 */
test("kategoriya kartalaridagi matn foto ustida ham o'qiladi", async ({ page }) => {
  await page.goto("/ru");
  await page.locator("#categories").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  const targets = await page.evaluate(() => {
    const cv = document.createElement("canvas").getContext("2d")!;
    const toRgba = (c: string) => {
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = c;
      cv.fillRect(0, 0, 1, 1);
      const d = cv.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255] as const;
    };

    const out: { text: string; rgba: readonly number[]; large: boolean; box: number[] }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("#categories [data-card] h3")) {
      const r = el.getBoundingClientRect();
      if (r.top < 2 || r.bottom > innerHeight - 2 || r.width < 6) continue;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      out.push({
        text: el.textContent!.trim(),
        rgba: toRgba(cs.color),
        large: size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700),
        box: [Math.round(r.x) + 1, Math.round(r.y) + 1, Math.round(r.width) - 2, Math.round(r.height) - 2],
      });
    }
    return out;
  });

  expect(targets.length, "tekshirish uchun ko'rinadigan karta topilmadi").toBeGreaterThan(0);

  // Matnni olib tashlaymiz — qolgani sof fon.
  await page.addStyleTag({
    content: "*{color:transparent !important;-webkit-text-fill-color:transparent !important}",
  });
  await page.waitForTimeout(300);
  const shot = await page.screenshot();

  const png = await page.evaluate(async (bytes) => {
    const bmp = await createImageBitmap(new Blob([new Uint8Array(bytes)]));
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = c.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0);
    return { w: bmp.width, h: bmp.height, data: Array.from(ctx.getImageData(0, 0, bmp.width, bmp.height).data) };
  }, Array.from(shot));

  for (const t of targets) {
    const [tr, tg, tb, ta] = t.rgba;
    const [x, y, w, h] = t.box;
    const ratios: number[] = [];
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        const i = (yy * png.w + xx) * 4;
        const br = png.data[i], bg = png.data[i + 1], bb = png.data[i + 2];
        // Alfa'li matn fon bilan aralashadi — samarali rang shu.
        const er = ta * tr + (1 - ta) * br;
        const eg = ta * tg + (1 - ta) * bg;
        const eb = ta * tb + (1 - ta) * bb;
        ratios.push(contrast(luminance(er, eg, eb), luminance(br, bg, bb)));
      }
    }
    ratios.sort((a, b) => a - b);
    // 5-persentil: yakka piksel (ramka, ikon) natijani buzmasin.
    const worst = ratios[Math.floor(ratios.length * 0.05)];
    const need = t.large ? 3 : 4.5;
    expect(worst, `"${t.text}" — foto ustida ${worst.toFixed(2)}:1, kerak ${need}:1`).toBeGreaterThanOrEqual(need);
  }
});
