"use client";

import Image from "next/image";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, STAGGER, TRIGGER_START } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

export function Categories({ categories }: { categories: Category[] }) {
  const t = useTranslations("categories");
  const gridRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMediaTier();

  const featured = categories.find((c) => c.featured) ?? categories[0];
  const wide = categories.find((c) => c.wide);
  const rest = categories.filter((c) => c !== featured && c !== wide);

  /**
   * Kirish: kartalar pastdan **parda ko'tarilgandek** ochiladi
   * (clip-path), oddiy fade emas — bu bo'limning imzo harakati.
   * Katta karta oldin, kichiklari to'lqin bo'lib ergashadi.
   */
  useGSAP(
    () => {
      if (reduced || !gridRef.current) return;

      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-card]");
      gsap.fromTo(
        cards,
        { clipPath: "inset(100% 0% 0% 0%)", y: 18 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: DUR.cinematic,
          ease: "expo.out",
          stagger: STAGGER.base,
          scrollTrigger: {
              trigger: gridRef.current,
              start: TRIGGER_START,
              // Bir martalik emas: pastga scroll qilganda qaytadan
              // o'ynaydi, yuqoriga chiqib ketganda boshlang'ich holatga
              // qaytadi ("reset" — teskari o'ynatmaydi, shunchaki tiklaydi,
              // shuning uchun element ekranda turganda sakrash bo'lmaydi).
              toggleActions: "restart none none reset",
            },
        },
      );
    },
    { scope: gridRef, dependencies: [reduced] },
  );

  return (
        // `pt` kattaroq: hero'ning "ko'prik" kartasi bu bo'limga 40px kiradi.
    <section id="categories" className="scroll-mt-28 pt-24 pb-20 sm:pt-28 sm:pb-24">
      <div className="container-lux">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div
          ref={gridRef}
          className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[repeat(2,minmax(0,1fr))_auto]"
        >
          <CategoryCard
            category={featured}
            featured
            className="lg:row-span-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {rest.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ))}

          {/* Uzun karta — pastda butun qatorni egallaydi. */}
          {wide && (
            <CategoryCard
              key={wide._id}
              category={wide}
              wide
              className="sm:col-span-2 lg:col-span-3"
              sizes="100vw"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  featured = false,
  wide = false,
  className = "",
  sizes,
}: {
  category: Category;
  featured?: boolean;
  /** Uzun banner-karta: past va keng, matn chapda. */
  wide?: boolean;
  className?: string;
  sizes: string;
}) {
  const t = useTranslations("categories");
  const locale = useLocale() as Locale;
  const ref = useRef<HTMLElement>(null);
  const { reduced, pointerFx } = useMediaTier();

  /**
   * Ichki parallaks: karta kursorga tortilganda (Magnetic) ichidagi foto
   * **teskari** tomonga siljiydi. Shu qarama-qarshilik 3D siz chuqurlik
   * hissini beradi. §2 — faqat fine pointer.
   */
  useGSAP(
    () => {
      const el = ref.current;
      if (!pointerFx || !el) return;

      const img = el.querySelector<HTMLElement>("[data-img]");
      if (!img) return;

      const xTo = gsap.quickTo(img, "xPercent", { duration: 0.7, ease: "power3.out" });
      const yTo = gsap.quickTo(img, "yPercent", { duration: 0.7, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * -4);
        yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * -4);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref, dependencies: [pointerFx] },
  );

  /** Asosiy kategoriya doim mayin Ken Burns'da — "tirik" bo'lib turadi. */
  useGSAP(
    () => {
      if (reduced || !featured || !ref.current) return;
      const img = ref.current.querySelector<HTMLElement>("[data-img]");
      if (!img) return;

      gsap.to(img, {
        scale: 1.09,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: ref, dependencies: [reduced, featured] },
  );

  return (
    <Magnetic strength={pointerFx ? 0.12 : 0} padding={10} className={`h-full ${className}`}>
      <article
        ref={ref}
        data-card
        className={[
          "group relative isolate flex h-full min-h-56 overflow-hidden rounded-2xl",
          "border border-taupe/30 bg-warm-white",
          "transition-[border-color,box-shadow] duration-500 hover:border-gold/50",
          "hover:shadow-[0_10px_40px_-24px_rgba(41,34,30,0.5)]",
          "active:scale-[0.995]",
          featured ? "min-h-[22rem] lg:min-h-full" : "",
          // Uzun karta past va keng: banner ritmi, matn chap chekkada.
          wide ? "min-h-[12rem] lg:min-h-[14rem]" : "",
        ].join(" ")}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div data-img className="absolute inset-[-6%]">
            <Image
              src={category.image.src}
              alt={pick(category.image.alt, locale)}
              fill
              quality={IMAGE_QUALITY}
              sizes={sizes}
              /*
                Keng bannerda rasm o'ng tomonga suriladi — matn chapda,
                og'irlik o'ngda.

                `right` EMAS, `78%`: oq fonli mahsulot fotosi `contain`
                bilan chiziladi va keng kadrda tor kvadrat bo'lib qoladi.
                `right` uni chekkaga yopishtirib, yumaloq burchak bilan
                kesib tashlardi. 78% uni o'ng uchdan birga qo'yadi va
                nafas oladigan joy qoldiradi.
              */
              style={{
                ...mediaFit(category.image).style,
                objectPosition: wide ? "78% center" : undefined,
              }}
              className={[
                mediaFit(category.image).className,
                "transition-[filter,opacity] duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                // Kichik kartalar biroz rangsiz turadi va hover'da jonlanadi;
                // asosiy karta doim to'liq rangda.
                featured ? "" : "saturate-[0.8] group-hover:saturate-100",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Fotoning yuqori qismiga yengil tus — chuqurlik uchun; matnni
            o'qitish vazifasi bunda EMAS, u pastdagi `card-scrim` da. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-espresso/25 via-espresso/5 to-espresso/0"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom scale-y-0 bg-gradient-to-t from-gold/55 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-y-100"
        />

        {/* `card-scrim` matn blokining o'ziga qo'yilgan, kartaga emas:
            yuqoridagi `pt` — gradientning so'nish yo'lakchasi, ya'ni
            matn karta balandligidan qat'i nazar bir xil asosda turadi. */}
        <div className="card-scrim relative mt-auto flex w-full flex-col px-5 pt-14 pb-5 sm:px-6 sm:pt-16 sm:pb-6">
          {/* Karta ochilgach matn ham tiniqlashib chiqadi — karta
              clip-path bilan, matn esa opacity/blur bilan, ya'ni
              bir xossani ikki tizim yozmaydi. */}
          <Reveal variant="smoke" delay={0.18}>
            <h3
              className={[
                "font-display text-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                "group-hover:-translate-y-1",
                featured ? "text-[clamp(1.5rem,2.4vw,2rem)]" : "text-xl",
                wide ? "text-[clamp(1.4rem,2.2vw,1.9rem)]" : "",
              ].join(" ")}
            >
              {pick(category.title, locale)}
            </h3>

            {category.text && (
              <p className="measure mt-2 hidden text-[14px] leading-relaxed text-cream/90 sm:block">
                {pick(category.text, locale)}
              </p>
            )}
          </Reveal>

          <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] tracking-[0.06em] text-cream/0 uppercase transition-colors duration-500 group-hover:text-cream">
            {t("goTo")}
            <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
          </span>
        </div>
      </article>
    </Magnetic>
  );
}
