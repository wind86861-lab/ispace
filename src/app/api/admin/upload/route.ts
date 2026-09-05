import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";
import { analyzeImage } from "@/lib/image-analysis";

/**
 * Umumiy rasm yuklash — kontent muharrirlari uchun.
 *
 * `api/admin/images` dan farqi: u MAVJUD uyaning ustidan yozadi
 * (`imageSlots` dagi statik yo'lni almashtiradi). Bu yerda esa uya yo'q:
 * admin hali yaratilmagan mahsulot yoki maqolaga rasm qo'yayotgan
 * bo'lishi mumkin. Natija — shunchaki yangi URL; uni chaqiruvchi
 * kontentga o'zi yozadi.
 *
 * Fayl nomida mazmun xeshi bor, ya'ni har yangi rasm — yangi URL va
 * brauzer/optimizator keshi o'z-o'zidan chetlab o'tiladi.
 */
const MAX_BYTES = 12 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/*
 * Video ham qabul qilinadi — mahsulot galereyasi va hikoya bloklari
 * uchun. U `sharp` dan o'tmaydi: brauzerda ham, bu serverda ham
 * qayta kodlash vositasi yo'q, shuning uchun fayl qanday kelgan bo'lsa
 * shunday yoziladi. Shu sabab chegara ham boshqacha.
 */
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;
const ACCEPTED_VIDEO = new Set(["video/mp4", "video/webm"]);
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const UPLOAD_URL = "/media";

/** Fayl nomining boshiga tushadigan yorliq — yo'l emas. */
const SAFE = /^[a-z0-9-]{1,40}$/;

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin sozlanmagan" }, { status: 404 });
  }
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Sessiya tugagan. Qayta kiring." }, { status: 401 });
  }
  if (request.headers.get("x-requested-with") !== "ispace-admin") {
    return NextResponse.json({ error: "So‘rov rad etildi" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const prefix = String(form.get("prefix") ?? "img");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fayl yo‘q" }, { status: 400 });
  }
  const isVideo = ACCEPTED_VIDEO.has(file.type);
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_BYTES;

  if (file.size > limit) {
    return NextResponse.json(
      { error: `Fayl ${Math.round(limit / 1024 / 1024)} MB dan katta` },
      { status: 413 },
    );
  }
  if (!isVideo && !ACCEPTED.has(file.type)) {
    return NextResponse.json(
      { error: `Qo‘llab-quvvatlanmaydigan tur: ${file.type || "noma’lum"}` },
      { status: 415 },
    );
  }
  if (!SAFE.test(prefix)) {
    return NextResponse.json({ error: "Noto‘g‘ri nom" }, { status: 400 });
  }

  if (isVideo) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
    const name = `${prefix}.${hash}${file.type === "video/webm" ? ".webm" : ".mp4"}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), bytes);

    /*
     * `width`/`height` YO'Q: ularni o'qish uchun video konteynerini
     * ochish kerak. Chaqiruvchi bularsiz ham ishlaydi — video
     * `SmartMedia` da `object-cover` bilan chiziladi, ya'ni nisbat
     * konteynerdan olinadi.
     */
    return NextResponse.json({ ok: true, url: `${UPLOAD_URL}/${name}`, kind: "video" });
  }

  const input = Buffer.from(await file.arrayBuffer());

  /*
   * Rasm KESILMAYDI (`fit: "inside"`): bu yerda maqsad nisbat emas,
   * hajmni oqilona chegaralash. Kompozitsiya ko'rsatish vaqtida
   * `cover`/`contain` bilan hal qilinadi — turini `analyzeImage`
   * aniqlaydi (oq fonli mahsulot fotosi kesilmaydi).
   */
  const analysis = await analyzeImage(input);
  const output = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    /*
     * Kichraytirish rasmni doim biroz yumshatadi — bu resampling'ning
     * tabiati. Yengil unsharp uni qaytaradi.
     *
     * `sigma` ataylab kichik (0.7): kattaroq qiymat chekkalarda oq
     * halqa ("halo") beradi va foto sun'iy ko'rinadi. Maqsad —
     * yo'qotilganini qaytarish, o'tkirlikni oshirish emas.
     */
    .sharpen({ sigma: 0.7 })
    .webp({ quality: 92 })
    .toBuffer();

  const meta = await sharp(output).metadata();
  const hash = createHash("sha256").update(output).digest("hex").slice(0, 10);
  const name = `${prefix}.${hash}.webp`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), output);

  return NextResponse.json({
    ok: true,
    url: `${UPLOAD_URL}/${name}`,
    width: meta.width,
    height: meta.height,
    fit: analysis.fit,
    bg: analysis.bg,
  });
}
