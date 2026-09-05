"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import type { Media } from "@/content/types";

/**
 * Rasm maydoni — yo'l yozish o'rniga faylni yuklash.
 *
 * Ilgari muharrirda oddiy matn maydoni turardi va admin `/images/...`
 * yo'lini qo'lda yozishi, so'ng faylni boshqa bo'limdan yuklashi kerak
 * edi. Endi fayl shu yerda tanlanadi: server uni qayta kodlaydi va
 * `/media/<nom>.<xesh>.webp` qaytaradi, komponent esa o'sha URL'ni
 * kontentga yozadi.
 *
 * O'lcham ham serverdan keladi — admin uni bilishi shart emas.
 */
export function ImageUpload({
  label,
  media,
  prefix,
  onChange,
  hint,
  recommend,
  allowVideo = false,
}: {
  label: string;
  media: Media;
  /** Fayl nomining boshi — `product`, `category`, `post` kabi. */
  prefix: string;
  onChange: (next: Media) => void;
  hint?: string;
  /**
   * Tavsiya etilgan o'lcham.
   *
   * Admin qanday rasm kerakligini OLDINDAN bilishi kerak: kartaning
   * nisbati kontentga qarab o'zgaradi (kvadrat, vertikal yoki keng
   * banner) va noto'g'ri nisbatdagi foto kesilib, buyum yarim
   * ko'rinib qoladi. Yuklangandan keyin haqiqiy o'lcham shu bilan
   * solishtiriladi.
   */
  recommend?: { width: number; height: number };
  /**
   * `true` — video ham yuklash mumkin (MP4/WebM, 64 MB gacha).
   *
   * Hamma joyda emas: video faqat uni CHIZA OLADIGAN joylarda ma'noli —
   * galereya va hikoya bloklari. Karta kichik ikoni yoki logotip
   * o'rnida u foydasiz og'irlik bo'lardi.
   */
  allowVideo?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const [tooSmall, setTooSmall] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("prefix", prefix);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-requested-with": "ispace-admin" },
      body,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Yuklab bo‘lmadi");
      return;
    }
    setBroken(false);

    /*
     * Kichik rasm ogohlantiriladi, LEKIN rad etilmaydi: ba'zan boshqa
     * foto umuman yo'q va kichigi hech narsadan yaxshiroq. Qaror
     * adminniki, bizning ishimiz — oqibatini aytish.
     */
    // Video uchun o'lcham tekshiruvi o'tkazilmaydi: `width`/`height` kelmaydi.
    if (
      recommend &&
      data.kind !== "video" &&
      (data.width < recommend.width || data.height < recommend.height)
    ) {
      setTooSmall(`${data.width}×${data.height} — tavsiya etilgani ${recommend.width}×${recommend.height}. Rasm cho‘zilib, sifati pasayishi mumkin.`);
    } else {
      setTooSmall(null);
    }

    onChange({
      ...media,
      src: data.url,
      width: data.width,
      height: data.height,
      fit: data.fit,
      bg: data.bg,
    });
  }

  /*
   * Faqat HAQIQATAN mavjud bo'lishi mumkin bo'lgan yo'l ko'rsatiladi.
   *
   * Kontentda yo'l yozilgan bo'lsa ham fayl bo'lmasligi mumkin (masalan
   * hali yuklanmagan uya). `next/image` bunday yo'lni optimizatsiya
   * qilishga urinib 404/400 qaytaradi va konsolni to'ldiradi —
   * shuning uchun oldindan tekshiramiz.
   */
  /*
   * Fayl YO'LI ko'rsatilmaydi.
   *
   * U kontent muharririga hech narsa bermaydi — u rasmni ko'radi, yo'lni
   * emas — va "bu yerga link yozish kerakmi?" degan chalkashlik tug'diradi.
   * Yo'l dasturchi uchun kerak bo'lsa, u kontent JSON'ida turibdi.
   */
  const hasImage = Boolean(media.src) && !media.src.endsWith("/") && !broken;

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-espresso">{label}</p>

      <div className="flex flex-wrap items-start gap-4">
        <span className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-taupe/40 bg-cream">
          {hasImage && /\.(mp4|webm)$/i.test(media.src) ? (
            /* Ko'rish uchun — boshqaruvsiz, birinchi kadr yetarli. */
            <video src={media.src} muted playsInline preload="metadata" className="size-full object-cover" />
          ) : hasImage ? (
            <Image
              src={media.src}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <span className="grid h-full place-items-center text-taupe-text">
              <ImagePlus size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
          )}
        </span>

        <div className="grid gap-2">
          <input
            ref={input}
            type="file"
            accept={
              allowVideo
                ? "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                : "image/jpeg,image/png,image/webp,image/avif"
            }
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              // Bir xil faylni qayta tanlash ham hodisa bersin.
              e.target.value = "";
            }}
          />

          <span className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-taupe/40 px-3.5 py-2 text-[13px] text-espresso transition-colors duration-300 hover:border-gold/60 disabled:opacity-50"
            >
              {busy ? (
                <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus size={14} strokeWidth={1.6} aria-hidden="true" />
              )}
              {hasImage ? "Almashtirish" : allowVideo ? "Rasm yoki video" : "Rasm yuklash"}
            </button>

            {hasImage && (
              <button
                type="button"
                onClick={() => onChange({ ...media, src: "", width: undefined, height: undefined })}
                className="inline-flex items-center gap-2 rounded-xl border border-taupe/40 px-3.5 py-2 text-[13px] text-espresso-soft transition-colors duration-300 hover:border-rosewood/60 hover:text-rosewood"
              >
                <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
                Olib tashlash
              </button>
            )}
          </span>

          {recommend && (
            <p className="text-[11px] text-espresso-soft/85">
              Tavsiya etilgan o‘lcham:{" "}
              <span className="font-medium text-espresso">
                {recommend.width}×{recommend.height}
              </span>
              {media.width && media.height ? ` · yuklangani ${media.width}×${media.height}` : ""}
            </p>
          )}
          {hint && <p className="text-[11px] text-espresso-soft/85">{hint}</p>}
          {tooSmall && (
            <p className="text-[12px] text-rosewood">{tooSmall}</p>
          )}
          {error && (
            <p role="alert" className="text-[12px] text-rosewood">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
