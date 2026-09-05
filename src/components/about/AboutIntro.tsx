import Image from "next/image";
import type { About } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";

/**
 * Sahifa boshi: chapda matn va raqamlar, o'ngda katta media.
 *
 * Bosh sahifadagi `About` bo'limidan farqi — bu yerda matn to'liq
 * (qisqartirilmaydi) va sarlavha `h1`. Shuning uchun alohida komponent:
 * bitta komponentni ikkala vazifaga moslash uni shartlarga to'ldirardi.
 */
export function AboutIntro({
  about,
  locale,
  title,
}: {
  about: About;
  locale: Locale;
  title: string;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <Reveal>
          <p className="inline-block rounded-full border border-taupe/45 px-3.5 py-1.5 text-[11px] tracking-[0.16em] text-espresso-soft/85 uppercase">
            {pick(about.eyebrow, locale)}
          </p>
        </Reveal>

        <SplitHeading
          as="h1"
          label={title}
          className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1]"
        >
          {title}
        </SplitHeading>

        <div className="mt-6 flex flex-col gap-4">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} variant="smoke" delay={0.06 * i}>
              <p className="measure text-[16px] leading-relaxed text-espresso-soft">
                {pick(p, locale)}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Raqamlar — sahifaning "dalil" qismi. */}
        <Reveal stagger={0.08} delay={0.2} className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {about.stats.map((stat) => (
            <div key={stat._id} className="border-s border-taupe/40 ps-4">
              {/*
                Bosh sahifadagi bilan bir xil harakat: son ko'rish
                maydoniga kirganda sanaladi. Ilgari bu yerda oddiy matn
                turardi — bir xil ma'lumot ikki sahifada boshqacha
                ko'rinardi.

                `grouped` faqat o'n mingdan katta sonlarda: `2007` yil
                bo'lib qolishi kerak, "2 007" emas.
              */}
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                grouped={stat.value > 9999}
                className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-none text-gold-deep"
              />
              <p className="mt-1.5 text-[13px] leading-snug text-espresso-soft">
                {pick(stat.label, locale)}
              </p>
            </div>
          ))}
        </Reveal>
      </div>

      {/* O'ngdagi katta media — video muqovasi. */}
      <Reveal variant="mask" className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
          <Image
            src={about.video.poster.src}
            alt={pick(about.video.poster.alt, locale)}
            fill
            quality={IMAGE_QUALITY}
            priority
            sizes="(max-width: 1024px) 100vw, 46vw"
            style={mediaFit(about.video.poster).style}
            className={mediaFit(about.video.poster).className}
          />
        </div>
      </Reveal>
    </div>
  );
}
