import Image from "next/image";
import type { Media } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";

/**
 * Rasm yoki video — qaysi biri ekanini FAYL O'ZI aytadi.
 *
 * Ba'zi uyalarga admin ikkalasini ham yuklashi mumkin (banner, bo'lim
 * foni). Kontentda esa faqat yo'l turadi, tur emas — va bu ataylab:
 * yuklangan fayl yo'lni butunlay almashtiradi (`image-overrides`),
 * ya'ni turni alohida maydonda saqlash ikkinchi haqiqat manbasini
 * yaratardi va u yo'l bilan bir kunda rostdan chiqib ketardi.
 * Kengaytma esa doim faylning o'zi bilan birga keladi.
 *
 * Video ATAYLAB ovozsiz, uzluksiz va boshqaruvsiz: bu bezak sirt,
 * pleyer emas. Ovozli avtomatik ijroni brauzer baribir to'sadi.
 */
const VIDEO = /\.(mp4|webm)$/i;

export const isVideoSrc = (src: string) => VIDEO.test(src);

export function SmartMedia({
  media,
  locale,
  sizes,
  className = "",
  priority = false,
}: {
  media: Media;
  locale: Locale;
  /** `next/image` uchun; videoga taalluqli emas. */
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const alt = pick(media.alt, locale);

  if (isVideoSrc(media.src)) {
    return (
      <video
        src={media.src}
        // `poster` yo'q: birinchi kadr baribir darrov chiziladi va
        // qo'shimcha rasm yuklash faqat trafik qo'shardi.
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt || undefined}
        className={`size-full object-cover ${className}`}
      />
    );
  }

  const fit = mediaFit(media);

  return (
    <Image
      src={media.src}
      alt={alt}
      fill
      quality={IMAGE_QUALITY}
      priority={priority}
      sizes={sizes}
      style={fit.style}
      className={`${fit.className} ${className}`}
    />
  );
}
