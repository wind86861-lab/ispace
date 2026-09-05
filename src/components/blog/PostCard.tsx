import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Blog kartasi.
 *
 * Butun karta havola: sarlavhadagi `after:absolute after:inset-0` kartani
 * to'liq qoplaydi, ya'ni bosish maydoni matn kengligi bilan cheklanmaydi.
 */
export function PostCard({
  post,
  locale,
  index = 0,
  labels,
  reveal = true,
}: {
  post: Post;
  locale: Locale;
  index?: number;
  labels: { category: string; readingTime: string; readMore: string };
  /**
   * `false` — kirish animatsiyasi o'chiriladi.
   *
   * Karusel ichida shu kerak: slaydlar gorizontal kesiladi va ko'rish
   * maydoniga kirish-chiqishi karusel siljishiga bog'liq bo'lib qoladi.
   * Kuzatuvchi ularni "chiqib ketdi" deb hisoblab yashirib qo'yardi va
   * karta ochilmay qolardi.
   */
  reveal?: boolean;
}) {
  const card = (
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white transition-[border-color,box-shadow] duration-500 hover:border-gold/45 hover:shadow-[0_16px_50px_-30px_rgba(41,34,30,0.55)]">
        <div className="relative aspect-[8/5] overflow-hidden bg-cream">
          <Image
            src={post.cover.src}
            alt={pick(post.cover.alt, locale)}
            fill
            quality={IMAGE_QUALITY}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={mediaFit(post.cover).style}
            className={`${mediaFit(post.cover).className} transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.05]`}
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.1em] text-espresso-soft/85 uppercase">
            <span className="text-rosewood">{labels.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
          </p>

          <h3 className="mt-3 line-clamp-3 font-display text-[18px] leading-snug text-espresso transition-colors duration-500 group-hover:text-gold-ink">
            <Link
              href={`/blog/${post.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {pick(post.title, locale)}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-espresso-soft">
            {pick(post.excerpt, locale)}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <span className="text-[12px] text-espresso-soft/85">{labels.readingTime}</span>
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
