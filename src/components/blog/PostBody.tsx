import Image from "next/image";
import type { PostBlock } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";
import { headingId } from "./toc";

/**
 * Maqola matni.
 *
 * Har blok o'z tipi bo'yicha chiziladi — sahifaga xom HTML tushmaydi,
 * shuning uchun tozalash (sanitize) ham kerak emas.
 *
 * Rasm bloki mahsulot hikoyasidagi qoidaga bo'ysunadi: rasm HAQIQATAN
 * yuklanmagan bo'lsa blok umuman chizilmaydi va o'quvchi bo'sh
 * o'rindosh ramkani ko'rmaydi.
 */
export function PostBody({ blocks, locale }: { blocks: PostBlock[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        const key = `${block.kind}-${i}`;

        if (block.kind === "heading") {
          return (
            <Reveal key={key}>
              {/*
                `id` — mundarija havolasi uchun. U blok indeksidan
                hosil qilinadi, matndan emas: sarlavha tahrirlanganda
                havola buzilmasin.
              */}
              <h2
                id={headingId(i)}
                className="mt-4 scroll-mt-28 font-display text-[clamp(1.3rem,2.4vw,1.75rem)] leading-snug text-espresso"
              >
                {pick(block.text, locale)}
              </h2>
            </Reveal>
          );
        }

        if (block.kind === "paragraph") {
          return (
            <Reveal key={key} variant="smoke">
              <p className="text-[16px] leading-[1.75] text-espresso-soft">
                {pick(block.text, locale)}
              </p>
            </Reveal>
          );
        }

        if (block.kind === "list") {
          return (
            <Reveal key={key} stagger={0.06}>
              <ul className="flex flex-col gap-2.5">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-[16px] leading-[1.7] text-espresso-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold"
                    />
                    {pick(item, locale)}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        }

        if (block.kind === "quote") {
          return (
            <Reveal key={key} variant="smoke">
              <blockquote className="border-s-2 border-gold/60 py-1 ps-5">
                <p className="font-display text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-espresso">
                  {pick(block.text, locale)}
                </p>
                {block.author && (
                  <footer className="mt-2 text-[13px] text-espresso-soft/85">
                    {pick(block.author, locale)}
                  </footer>
                )}
              </blockquote>
            </Reveal>
          );
        }

        // Rasm — faqat yuklangani.
        if (block.media.uploaded !== true) return null;
        return (
          <Reveal key={key} variant="mask">
            <figure className="my-2">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-cream">
                <Image
                  src={block.media.src}
                  alt={pick(block.media.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  sizes="(max-width: 1024px) 100vw, 46rem"
                  style={mediaFit(block.media).style}
                  className={mediaFit(block.media).className}
                />
              </div>
              <figcaption className="mt-2 text-[13px] text-espresso-soft/85">
                {pick(block.media.alt, locale)}
              </figcaption>
            </figure>
          </Reveal>
        );
      })}
    </div>
  );
}
