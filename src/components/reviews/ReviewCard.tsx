import Image from "next/image";
import { ArrowRight, BadgeCheck, Images, Play } from "lucide-react";
import type { Review } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "./Stars";
import { countPhotos, countVideos, reviewMedia } from "./media";

/**
 * Sharh kartasi — blog kartasi bilan BIR XIL qolipda.
 *
 * Qolip ataylab takrorlanadi: ustki media maydoni, ostida meta qatori,
 * sarlavha, matn va pastda "davomi" havolasi. Foydalanuvchi blogda shu
 * ritmni allaqachon o'rgangan; sharhlar sahifasi boshqacha ko'rinsa,
 * u yangi qoidani qaytadan o'qishga majbur bo'lardi.
 *
 * Farqi mazmunda: kategoriya o'rnida — reyting, sarlavha o'rnida —
 * mijoz ismi, matn esa sharhning o'zi.
 */
export function ReviewCard({
  review,
  locale,
  index = 0,
  labels,
  onOpen,
  reveal = true,
}: {
  review: Review;
  locale: Locale;
  index?: number;
  labels: {
    ratingAria: string;
    verified: string;
    photos: string;
    video: string;
    readMore: string;
  };
  /** Kartani bosish — to'liq sharhni modalda ochadi. */
  onOpen: () => void;
  /**
   * `false` — kirish animatsiyasi o'chiriladi.
   *
   * Karusel ichida shu kerak: slaydlar gorizontal kesiladi va
   * `Reveal` ko'rish maydoni kuzatuvchisiga tayanadi. Kuzatuvchi
   * kesilgan slaydni "ekrandan chiqdi" deb hisoblab yashirib
   * qo'yardi va karta ochilmay qolardi.
   */
  reveal?: boolean;
}) {
  /*
   * Media ro'yxati bitta manbadan (`reviewMedia`): karta, modal va
   * ko'ruvchi bir xil tartibni ko'radi. Yuklanmagan uyalar o'sha
   * yerda tashlanadi — bo'sh o'rindosh ramka hech qayerda chizilmaydi.
   */
  const items = reviewMedia(review);
  /*
   * Muqova: avval foto, bo'lmasa YUKLANGAN video (uning birinchi kadri
   * chiziladi). YouTube muqova bo'lolmaydi — fayl bizda emas, kadrni
   * esa tashqi manbadan tortish `next.config` da taqiqlangan.
   */
  const cover =
    items.find((i) => i.kind === "photo" || i.kind === "video") ?? null;
  const photos = countPhotos(items);
  const videos = countVideos(items);
  const author = pick(review.author, locale);

  const card = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white transition-[border-color,box-shadow] duration-500 hover:border-gold/45 hover:shadow-[0_16px_50px_-30px_rgba(41,34,30,0.55)]">
      <div className="relative aspect-[8/5] overflow-hidden bg-cream">
        {cover?.kind === "photo" ? (
          <Image
            src={cover.media.src}
            alt={pick(cover.media.alt, locale)}
            fill
            quality={IMAGE_QUALITY}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={mediaFit(cover.media).style}
            className={`${mediaFit(cover.media).className} transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.05]`}
          />
        ) : cover?.kind === "video" ? (
          /*
              `preload="metadata"` — faqat birinchi kadr uchun yetarli
              bo'lgan bo'lak so'raladi, butun rolik emas. Karta
              ro'yxatda o'nlab bo'lishi mumkin.
            */
          <video
            src={cover.media.src}
            muted
            playsInline
            preload="metadata"
            aria-label={pick(cover.media.alt, locale) || undefined}
            className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.05]"
          />
        ) : (
          /*
              Fotosiz sharh — ko'pchilik shunday.

              Bu yerda O'RINDOSH RASM emas, tipografik panel turadi:
              qo'shtirnoq, ism harflari va reyting. Shu tufayli panjara
              ritmi buzilmaydi (hamma karta bir xil balandlikda), lekin
              hech kimga "rasm bor edi, yuklanmadi" degan taassurot
              ham bermaydi.
            */
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-gradient-to-br from-greige/70 via-cream to-warm-white"
          >
            <span className="pointer-events-none absolute -top-6 left-4 font-display text-[7rem] leading-none text-rosewood/14 transition-colors duration-500 select-none group-hover:text-rosewood/24">
              &rdquo;
            </span>
            <span className="font-display relative text-[2.4rem] leading-none text-rosewood/75 transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-110">
              {initialsOf(author)}
            </span>
          </span>
        )}

        {/*
            Media belgilari — media BOR bo'lgandagina.

            Ular kartani bosish nimani ochishini oldindan aytadi:
            foydalanuvchi "video bormi?" deb bosib ko'rishi shart emas.
          */}
        {(photos > 1 || videos > 0) && (
          <span className="absolute right-3 bottom-3 flex items-center gap-1.5">
            {photos > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-espresso/70 px-2.5 py-1 text-[11px] text-cream backdrop-blur-sm">
                <Images size={12} strokeWidth={1.8} aria-hidden="true" />
                {photos}
              </span>
            )}
            {videos > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rosewood/85 px-2.5 py-1 text-[11px] text-cream backdrop-blur-sm">
                <Play
                  size={11}
                  strokeWidth={1.8}
                  fill="currentColor"
                  aria-hidden="true"
                />
                {labels.video}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.1em] text-espresso-soft/85 uppercase">
          <Stars rating={review.rating} label={labels.ratingAria} size={13} />
          <span aria-hidden="true">·</span>
          <time dateTime={review.publishedAt}>
            {formatDate(review.publishedAt, locale)}
          </time>
        </p>

        {/*
            Butun karta bosiladi: `after:absolute after:inset-0` tugma
            maydonini kartaga yoyadi. Blogdagi qoidaning aynan o'zi,
            faqat u yerda havola, bu yerda modal.
          */}
        <h3 className="font-display mt-3 flex items-center gap-2 text-[18px] leading-snug text-espresso transition-colors duration-500 group-hover:text-gold-ink">
          <button
            type="button"
            onClick={onOpen}
            className="text-start after:absolute after:inset-0 after:content-['']"
          >
            {author}
          </button>
          <BadgeCheck
            size={15}
            strokeWidth={1.8}
            aria-label={labels.verified}
            className="shrink-0 text-rosewood"
          />
        </h3>

        <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-espresso-soft">
          {pick(review.text, locale)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-[12px] text-espresso-soft/85">
            {photos > 0 ? labels.photos : labels.verified}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gold-deep">
            {labels.readMore}
            <ArrowRight
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </article>
  );

  return reveal ? (
    <Reveal delay={(index % 3) * 0.07} y={24} className="h-full">
      {card}
    </Reveal>
  ) : (
    card
  );
}

/**
 * Ism harflari — mijozdan portret so'ramaymiz.
 *
 * Ikkita harf kartani "jonli" qilish uchun yetarli va u HAR DOIM bor:
 * hech qachon bo'sh ramkaga aylanmaydi.
 */
export function initialsOf(author: string) {
  return author
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}
