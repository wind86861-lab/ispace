/**
 * Bir martalik ko'chirish: `public/uploads/` → `data/uploads/`.
 *
 * `public/` build vaqtida ro'yxatga olinadi, shuning uchun u yerga
 * runtime'da qo'shilgan fayllar production'da berilmasdi. Endi ular
 * `data/uploads/` da va `/media/...` marshruti orqali beriladi.
 *
 *   node scripts/migrate-uploads.mjs
 */
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OLD_DIR = path.join(process.cwd(), "public", "uploads");
const NEW_DIR = path.join(process.cwd(), "data", "uploads");
const OVERRIDES = path.join(process.cwd(), "data", "image-overrides.json");

if (!existsSync(OLD_DIR)) {
  console.log("public/uploads yo'q — ko'chirish kerak emas");
  process.exit(0);
}

await mkdir(NEW_DIR, { recursive: true });

const files = await readdir(OLD_DIR);
for (const f of files) {
  await rename(path.join(OLD_DIR, f), path.join(NEW_DIR, f));
  console.log("  →", f);
}
await rm(OLD_DIR, { recursive: true, force: true });

/* --- overrides: yo'llarni yangilash + eski satr formatini obyektga --- */
const raw = JSON.parse(await readFile(OVERRIDES, "utf8").catch(() => "{}"));
const next = {};

for (const [key, value] of Object.entries(raw)) {
  const entry = typeof value === "string" ? { url: value } : { ...value };
  entry.url = entry.url.replace(/^\/uploads\//, "/media/");

  // Eski yozuvlarda `fit` yo'q — faylni tahlil qilib qo'shamiz, shunda
  // oq fonli mahsulot fotolari kesilmasdan ko'rsatiladi.
  if (!entry.fit) {
    const file = path.join(NEW_DIR, path.basename(entry.url));
    try {
      const { data } = await sharp(file).flatten({ background: "#ffffff" })
        .resize(24, 24, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
      const px = (x, y) => { const i = (y * 24 + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };
      const border = [];
      for (let i = 0; i < 24; i++) border.push(px(i, 0), px(i, 23), px(0, i), px(23, i));
      const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
      const lums = border.map(lum);
      const mean = lums.reduce((s, v) => s + v, 0) / lums.length;
      const spread = Math.sqrt(lums.reduce((s, v) => s + (v - mean) ** 2, 0) / lums.length);
      if (mean >= 218 && spread <= 26) {
        const avg = [0, 1, 2].map((c) => Math.round(border.reduce((s, p) => s + p[c], 0) / border.length));
        entry.fit = "contain";
        entry.bg = `#${avg.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      } else {
        entry.fit = "cover";
      }
    } catch {
      entry.fit = "cover";
    }
  }
  next[key] = entry;
  console.log(`  ${key} → ${entry.url} (${entry.fit})`);
}

await writeFile(OVERRIDES, JSON.stringify(next, null, 2) + "\n");
console.log(`✓ ${files.length} ta fayl ko'chirildi, ${Object.keys(next).length} ta yozuv yangilandi`);
