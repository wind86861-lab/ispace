import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

/**
 * Admin orqali yuklangan rasmlarni beradi.
 *
 * Nega `public/` emas: `next start` `public/` papkasini build vaqtida
 * ro'yxatga oladi va keyin qo'shilgan fayllarni bermaydi — so'rov
 * marshrutlashga tushib, 307 redirect qaytadi. Ishlab chiqishda bu
 * ko'rinmaydi (dev har so'rovda diskdan o'qiydi), production'da esa
 * yuklangan rasm umuman ochilmaydi.
 *
 * Shuning uchun yuklamalar `data/uploads/` da — ular build artefakti emas,
 * runtime ma'lumoti — va shu marshrut orqali beriladi.
 *
 * Fayl nomida mazmun xeshi bo'lgani uchun kesh abadiy (`immutable`).
 */
const DIR = path.join(process.cwd(), "data", "uploads");

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/** Faqat oddiy fayl nomlari: yo'l bo'ylab chiqib ketish imkonsiz. */
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

/**
 * `Range: bytes=...` sarlavhasini o'qiydi.
 *
 * Video uchun bu SHART, xushmuomalalik emas: Safari faylni faqat
 * `206 Partial Content` bilan o'ynatadi, boshqa brauzerlarda esa usiz
 * vaqt chizig'idan sakrab bo'lmaydi — butun fayl qaytadan yuklanadi.
 * Faqat eng oddiy `bytes=start-end` shakli qo'llab-quvvatlanadi; ko'p
 * oraliqli so'rovni hech bir brauzer media uchun yubormaydi.
 */
function parseRange(header: string | null, size: number) {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;

  const [, rawStart, rawEnd] = m;
  if (rawStart === "" && rawEnd === "") return null;

  // `bytes=-500` — oxirgi 500 bayt.
  const start = rawStart === "" ? Math.max(0, size - Number(rawEnd)) : Number(rawStart);
  const end = rawStart === "" || rawEnd === "" ? size - 1 : Math.min(Number(rawEnd), size - 1);

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return { invalid: true as const };
  }
  return { start, end, invalid: false as const };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;

  if (parts.length !== 1 || !SAFE_NAME.test(parts[0]) || parts[0].includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(parts[0]).toLowerCase();
  const type = MIME[ext];
  if (!type) return new Response("Not found", { status: 404 });

  const file = path.join(DIR, parts[0]);
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });

  const common = {
    "content-type": type,
    "cache-control": "public, max-age=31536000, immutable",
    // Brauzerga qismli so'rov mumkinligini aytadi — usiz u umuman
    // `Range` yubormaydi va videoda oldinga sakrash ishlamaydi.
    "accept-ranges": "bytes",
  };

  const range = parseRange(request.headers.get("range"), info.size);

  if (range?.invalid) {
    return new Response(null, {
      status: 416,
      headers: { ...common, "content-range": `bytes */${info.size}` },
    });
  }

  if (range) {
    const part = Readable.toWeb(
      createReadStream(file, { start: range.start, end: range.end }),
    ) as WebReadableStream<Uint8Array>;

    return new Response(part as unknown as BodyInit, {
      status: 206,
      headers: {
        ...common,
        "content-length": String(range.end - range.start + 1),
        "content-range": `bytes ${range.start}-${range.end}/${info.size}`,
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(file)) as WebReadableStream<Uint8Array>;

  return new Response(stream as unknown as BodyInit, {
    headers: { ...common, "content-length": String(info.size) },
  });
}
