import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { getImageSlots, getSlotById } from "@/lib/image-slots";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";
import { OVERRIDES_FILE, readOverrides, type ImageOverrides } from "@/lib/image-overrides";
import { analyzeImage } from "@/lib/image-analysis";

/**
 * Rasm yuklash API'si.
 *
 * Xavfsizlik qatlamlari:
 *  1. `ADMIN_PASSWORD` berilmagan bo'lsa API umuman yo'q (404).
 *  2. Har so'rov imzolangan sessiya cookie'si bilan tekshiriladi.
 *  3. Yozish yo'li **faqat** `imageSlots` ro'yxatidan olinadi — mijoz
 *     yuborgan yo'l hech qachon ishlatilmaydi (path traversal imkonsiz).
 *  4. Fayl turi va hajmi tekshiriladi, so'ng `sharp` orqali qayta
 *     kodlanadi — diskka faqat haqiqiy rasm baytlari tushadi.
 *  5. Mutatsiyalar `X-Requested-With` sarlavhasini talab qiladi
 *     (SameSite=Strict ustiga qo'shimcha CSRF to'sig'i).
 */
const MAX_BYTES = 12 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);

/*
 * Video uyalari uchun alohida chegara va ro'yxat.
 *
 * Video `sharp` dan o'tmaydi — u diskka qanday kelgan bo'lsa shunday
 * yoziladi. Shu sababli hajm chegarasi ham boshqacha: 12 MB li video
 * bir necha soniya bo'ladi, 64 MB esa ~1-2 daqiqalik shourum rolikiga
 * yetadi. Bundan kattasi saytga umuman qo'yilmasligi kerak — u
 * mobil internetda ochilmaydi.
 */
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;
const ACCEPTED_VIDEO = new Set(["video/mp4", "video/webm"]);

/*
 * Yuklamalar `public/` da EMAS, `data/uploads/` da saqlanadi va
 * `src/app/media/[...path]` marshruti orqali beriladi — sababi o'sha
 * fayldagi izohda: `next start` `public/` ni build vaqtida ro'yxatga
 * oladi va keyin qo'shilgan fayllarni bermaydi.
 */
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const UPLOAD_URL = "/media";

async function guard(request: Request, mutating: boolean) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin sozlanmagan" }, { status: 404 });
  }
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Sessiya tugagan. Qayta kiring." }, { status: 401 });
  }
  if (mutating && request.headers.get("x-requested-with") !== "ispace-admin") {
    return NextResponse.json({ error: "So‘rov rad etildi" }, { status: 403 });
  }
  return null;
}

async function writeOverrides(next: ImageOverrides) {
  await mkdir(path.dirname(OVERRIDES_FILE), { recursive: true });
  await writeFile(OVERRIDES_FILE, JSON.stringify(next, null, 2) + "\n");
  // Bosh sahifa statik generatsiya qilingan — yangi rasm ko'rinishi uchun
  // uni qayta hosil qilamiz (dev'da ham, `next start` da ham ishlaydi).
  revalidatePath("/", "layout");
}

/** Slot uchun eski yuklamalarni tozalaydi — `public/uploads` shishmasin. */
async function removeOldUploads(slotId: string, keep?: string) {
  const files = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((f) => f.startsWith(`${slotId}.`) && f !== keep)
      .map((f) => rm(path.join(UPLOAD_DIR, f), { force: true })),
  );
}

export async function GET(request: Request) {
  const denied = await guard(request, false);
  if (denied) return denied;

  const overrides = await readOverrides();

  const items = await Promise.all(
    (await getImageSlots()).map(async (slot) => {
      const entry = overrides[slot.path];
      const url = (typeof entry === "string" ? entry : entry?.url) ?? slot.path;
      const fit = typeof entry === "object" ? entry.fit : undefined;
      const file = url.startsWith(`${UPLOAD_URL}/`)
        ? path.join(UPLOAD_DIR, url.slice(UPLOAD_URL.length + 1))
        : path.join(process.cwd(), "public", url.replace(/^\//, ""));
      const info = await stat(file).then(
        (s) => ({ bytes: s.size, updatedAt: s.mtime.toISOString() }),
        () => null,
      );

      /*
       * Faylning HAQIQIY o'lchami — admin uni uyaga kerakli o'lcham
       * bilan yonma-yon ko'radi va rasm kichik bo'lsa ogohlantirish
       * oladi. Buzilgan yoki SVG fayl uchun `sharp` o'lcham bermasligi
       * mumkin — u holda shunchaki ko'rsatilmaydi.
       */
      const isVideoFile = /\.(mp4|webm)$/i.test(url);
      const size = info && slot.kind !== "video" && !isVideoFile
        ? await sharp(file)
            .metadata()
            .then(
              (m) => (m.width && m.height ? { actualWidth: m.width, actualHeight: m.height } : null),
              () => null,
            )
        : null;

      return {
        ...slot,
        url,
        fit,
        replaced: Boolean(entry),
        missing: info === null,
        ...info,
        ...size,
      };
    }),
  );

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const denied = await guard(request, true);
  if (denied) return denied;

  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const file = form.get("file");

  const slot = await getSlotById(id);
  if (!slot) return NextResponse.json({ error: "Noma’lum slot" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl yo‘q" }, { status: 400 });
  /*
   * `media` uyasida qaror FAYLGA qarab qabul qilinadi: admin rasm ham,
   * video ham yuklashi mumkin. `video` uyasi esa faqat videoni oladi.
   */
  const isVideoSlot =
    slot.kind === "video" || (slot.kind === "media" && file.type.startsWith("video/"));
  const limit = isVideoSlot ? MAX_VIDEO_BYTES : MAX_BYTES;
  const accepted =
    slot.kind === "media"
      ? new Set([...ACCEPTED, ...ACCEPTED_VIDEO])
      : isVideoSlot
        ? ACCEPTED_VIDEO
        : ACCEPTED;

  if (file.size > limit)
    return NextResponse.json(
      { error: `Fayl ${Math.round(limit / 1024 / 1024)} MB dan katta` },
      { status: 413 },
    );
  if (!accepted.has(file.type))
    return NextResponse.json(
      { error: `Qo‘llab-quvvatlanmaydigan tur: ${file.type || "noma’lum"}` },
      { status: 415 },
    );

  const input = Buffer.from(await file.arrayBuffer());
  const targetExt = path.extname(slot.path).toLowerCase();

  let output: Buffer;
  let fit: "cover" | "contain" | undefined;
  let bg: string | undefined;

  if (isVideoSlot) {
    /*
     * Video qayta kodlanmaydi: brauzerda ffmpeg yo'q, serverda esa uni
     * saqlash bu loyihaning vazifasi emas. Fayl qanday kelgan bo'lsa
     * shunday yoziladi — shuning uchun admin uchun izohda kodek talabi
     * aytilgan (`image-slots.ts`).
     *
     * Kengaytma FAYL turidan olinadi, uyadagi yo'ldan emas: admin
     * `.webm` yuklashi mumkin, kontentda esa `.mp4` yozilgan.
     */
    output = input;
  } else if (targetExt === ".svg") {
    if (file.type !== "image/svg+xml")
      return NextResponse.json({ error: "Bu slot uchun SVG kerak" }, { status: 415 });
    output = input;
  } else {
    /*
     * Rasm ATAYLAB kesilmaydi.
     *
     * Ilgari bu yerda `fit: "cover"` turardi va rasm slot nisbatiga
     * kesilardi. Xona fotosi uchun bu ishlardi, ammo oq fonli mahsulot
     * fotosining cheti kesilib, buyum yarim ko'rinib qolardi — va buni
     * ortga qaytarib bo'lmasdi, chunki kesilgan nusxa diskka yozilardi.
     *
     * Endi `fit: "inside"` — faqat kichraytiradi, kompozitsiyaga tegmaydi.
     * Rasm maydonga qanday joylashishi esa ko'rsatish vaqtida hal qilinadi
     * (`analyzeImage` aniqlagan `cover`/`contain` bo'yicha).
     */
    const analysis = await analyzeImage(input);
    fit = analysis.fit;
    bg = analysis.bg;

    const pipeline = sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: Math.max(slot.width, 1200),
        height: Math.max(slot.height, 1200),
        fit: "inside",
        withoutEnlargement: true,
      })
      // Kichraytirish yumshatadi — yengil unsharp uni qaytaradi.
      // Tartib muhim: o'tkirlash KICHRAYTIRISHDAN KEYIN bo'lsin, aks
      // holda u qayta namunalashda yo'qoladi (izoh `admin/upload` da).
      .sharpen({ sigma: 0.7 });

    output =
      targetExt === ".png"
        ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
        : targetExt === ".jpg" || targetExt === ".jpeg"
          ? await pipeline.jpeg({ quality: 92, mozjpeg: true }).toBuffer()
          : await pipeline.webp({ quality: 92 }).toBuffer();
  }

  /*
   * Fayl nomida mazmun xeshi bor — ya'ni har yangi rasm YANGI URL oladi.
   * Bu shart: `next/image` optimizatori natijani URL bo'yicha keshlaydi va
   * kesh xotirada ham turadi, shuning uchun bir xil nom ostida faylni
   * almashtirish ishlamaydi (eski rasm qaytaveradi).
   */
  const hash = createHash("sha256").update(output).digest("hex").slice(0, 10);
  const ext = isVideoSlot ? (file.type === "video/webm" ? ".webm" : ".mp4") : targetExt;
  const name = `${slot.id}.${hash}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), output);
  await removeOldUploads(slot.id, name);

  const url = `${UPLOAD_URL}/${name}`;
  await writeOverrides({ ...(await readOverrides()), [slot.path]: { url, fit, bg } });

  /*
   * Yozilgan faylning o'lchami — admin kartasi uni darrov ko'rsatadi.
   * `analyzeImage` dagi o'lcham KIRISHNIKI, bu esa CHIQISHNIKI: qayta
   * o'lchashdan keyin ular farq qiladi.
   */
  const out = isVideoSlot
    ? { width: undefined, height: undefined }
    : await sharp(output)
        .metadata()
        .then((m) => ({ width: m.width, height: m.height }), () => ({ width: undefined, height: undefined }));

  return NextResponse.json({
    ok: true,
    id: slot.id,
    url,
    fit,
    bytes: output.length,
    actualWidth: out.width,
    actualHeight: out.height,
  });
}

/** Dastlabki (o'rindosh) rasmni qaytaradi — yuklangan nusxa o'chiriladi. */
export async function DELETE(request: Request) {
  const denied = await guard(request, true);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  const slot = await getSlotById(id);
  if (!slot) return NextResponse.json({ error: "Noma’lum slot" }, { status: 400 });

  const overrides = await readOverrides();
  if (!overrides[slot.path])
    return NextResponse.json({ error: "Bu rasm almashtirilmagan" }, { status: 404 });

  /*
   * Tartib muhim: AVVAL overrides yoziladi, KEYIN fayl o'chiriladi.
   * Teskarisida oraliqda `image-overrides.json` allaqachon yo'q faylga
   * ishora qilib turadi va o'sha lahzadagi so'rov buzilgan rasm oladi
   * ("isn't a valid image ... received null"). POST ham xuddi shu
   * mantiqda: fayl oldin yoziladi, havola keyin e'lon qilinadi.
   */
  delete overrides[slot.path];
  await writeOverrides(overrides);
  await removeOldUploads(slot.id);

  // Qaytarilgan o'rindoshning o'lchami — karta uni ham ko'rsatadi.
  const out = slot.kind === "video" || /\.(mp4|webm)$/i.test(slot.path)
    ? { width: undefined, height: undefined }
    : await sharp(path.join(process.cwd(), "public", slot.path.replace(/^\//, "")))
        .metadata()
        .then((m) => ({ width: m.width, height: m.height }), () => ({ width: undefined, height: undefined }));

  return NextResponse.json({
    ok: true,
    id: slot.id,
    url: slot.path,
    actualWidth: out.width,
    actualHeight: out.height,
  });
}
