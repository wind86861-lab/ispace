import Image from "next/image";
import type { Media } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Rasmlar qatori — galereya va sertifikatlar uchun.
 *
 * `requireUploaded` bilan chaqirilganda faqat HAQIQATAN yuklangan
 * rasmlar chiziladi va bittasi ham bo'lmasa qator butunlay
 * ko'rsatilmaydi. Sertifikatlar aynan shunday ishlaydi: ular kontentda
 * oldindan e'lon qilingan, lekin mijoz faylni yuklamaguncha sahifada
 * bo'sh ramkalar turmasligi kerak.
 */
export function MediaRow({
  items,
  locale,
  title,
  ratio = "aspect-square",
  columns = "sm:grid-cols-2 lg:grid-cols-4",
  requireUploaded = false,
}: {
  items: Media[];
  locale: Locale;
  title?: string;
  ratio?: string;
  columns?: string;
  requireUploaded?: boolean;
}) {
  const shown = requireUploaded ? items.filter((m) => m.uploaded === true) : items;
  if (shown.length === 0) return null;

  return (
    <section>
      {title && (
        <Reveal>
          <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] text-espresso">{title}</h2>
        </Reveal>
      )}

      <ul className={`mt-7 grid gap-4 ${columns}`}>
        {shown.map((m, i) => (
          <li key={m.src}>
            <Reveal variant="mask" delay={(i % 4) * 0.06}>
              <span
                /*
                  Hover — kartaning o'zi ko'tariladi, foto esa ichida
                  yaqinlashadi. Ikkalasi `transform` da: qayta joylashuv
                  bo'lmaydi va harakat kompozitorda bajariladi.
                */
                className={`group relative block ${ratio} overflow-hidden rounded-2xl border border-taupe/30 bg-cream transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_44px_-24px_rgba(41,34,30,0.4)]`}
              >
                <Image
                  src={m.src}
                  alt={pick(m.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={mediaFit(m).style}
                  className={`${mediaFit(m).className} transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.06]`}
                />
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
