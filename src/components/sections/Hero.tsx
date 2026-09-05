"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import type { HeroSlide, TrustItem } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, STAGGER } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";
import { useUi } from "@/store/useUi";
import { useLenis } from "@/components/providers/LenisProvider";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { DrawIcon } from "@/components/ui/DrawIcon";
import { Button } from "@/components/ui/Button";

const AUTOPLAY_MS = 6500;

/**
 * Hero — saytning imzo bo'limi (§3-bo'lim rejada).
 *
 * Vazifalar taqsimoti (§10 chegarasi):
 *  · **Embla** — slayd dvigateli: drag/swipe, klaviatura, autoplay, a11y.
 *    `Fade` plagini slaydlar orasidagi opacity o'tishini oladi.
 *  · **GSAP** — kinematik qatlam: kiruvchi slaydning clip-path "pardasi",
 *    Ken Burns zoom, matn orkestri va kursor parallaksi.
 * Ikkalasi turli DOM tugunlarini va turli xossalarni animatsiya qiladi,
 * ya'ni bir-birining ustidan yozmaydi.
 */
export function Hero({ slides, trust }: { slides: HeroSlide[]; trust: TrustItem[] }) {
  const t = useTranslations("hero");
  const locale = useLocale() as Locale;
  const { reduced, pointerFx } = useMediaTier();
  const openOverlay = useUi((s) => s.open);
  const lenis = useLenis();

  const [selected, setSelected] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLUListElement>(null);

  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, duration: reduced ? 0 : 32, watchDrag: !reduced },
    // §14 — harakat kamaytirilgan bo'lsa autoplay umuman ulanmaydi.
    reduced ? [Fade()] : [Fade(), Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false })],
  );

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    onSelect();
    embla.on("select", onSelect).on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect).off("reInit", onSelect);
    };
  }, [embla]);

  /* ---- kinematik qatlam: parda + Ken Burns ---- */
  useGSAP(
    () => {
      if (reduced || !stageRef.current) return;

      const active = stageRef.current.querySelector<HTMLElement>(
        `[data-slide="${selected}"]`,
      );
      if (!active) return;

      const frame = active.querySelector<HTMLElement>("[data-frame]");
      if (!frame) return;

      // Parda o'ngdan chapga ochiladi — oddiy fade emas, "kadr ochilishi".
      // Ken Burns bu yerda YO'Q: u CSS animatsiyasida (pastga qarang),
      // chunki 9 soniyalik uzluksiz scale'ni JS bilan haydash har kadrda
      // asosiy oqimni band qiladi; CSS uni kompozitorga beradi.
      gsap.fromTo(
        frame,
        { clipPath: "inset(0% 0% 0% 100%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.cinematic, ease: "expo.out" },
      );
    },
    { scope: stageRef, dependencies: [selected, reduced] },
  );

  /* ---- kursor parallaksi (§2 — faqat fine pointer) ---- */
  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!pointerFx || !stage) return;

      const layers = stage.querySelectorAll<HTMLElement>("[data-parallax]");
      const xTo = Array.from(layers).map((l) =>
        gsap.quickTo(l, "xPercent", { duration: 0.9, ease: "power3.out" }),
      );
      const yTo = Array.from(layers).map((l) =>
        gsap.quickTo(l, "yPercent", { duration: 0.9, ease: "power3.out" }),
      );

      const onMove = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        xTo.forEach((fn) => fn(dx * -2.5));
        yTo.forEach((fn) => fn(dy * -2.5));
      };
      const onLeave = () => {
        xTo.forEach((fn) => fn(0));
        yTo.forEach((fn) => fn(0));
      };

      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: stageRef, dependencies: [pointerFx] },
  );

  /* ---- trust bar: chapdan o'ngga suzadi (birinchi yuklanishda) ---- */
  useGSAP(
    () => {
      if (reduced || !trustRef.current) return;
      /*
       * `children` EMAS: bo'laklarning o'zi qimirlamasligi kerak, aks
       * holda ular orasidagi 1px ajratuvchi fon ochilib qoladi. Faqat
       * ichkaridagi mazmun suziladi.
       */
      gsap.from(trustRef.current.querySelectorAll("[data-trust-item]"), {
        opacity: 0,
        x: -22,
        duration: DUR.reveal,
        ease: "power3.out",
        stagger: STAGGER.base,
        delay: 0.6,
        // Birinchi yuklanishda kirish orkestrining bir qismi sifatida
        // o'ynaydi; keyin sahifa boshiga qaytilganda ham qaytadan.
        scrollTrigger: {
          trigger: trustRef.current,
          start: "top 95%",
          toggleActions: "restart none none reset",
        },
      });
    },
    { scope: trustRef, dependencies: [reduced] },
  );

  const slide = slides[selected];

  const onCta = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (href === "#consult") openOverlay("consult");
      else lenis.scrollTo(href);
    },
    [openOverlay, lenis],
  );

  /*
   * Rasm paneli va "ko'prik" kartasi BIR XIL vizual tilda: bir xil burchak
   * radiusi va bir xil pastga yo'nalgan yumshoq soya. Aynan shu ikkilik
   * kompozitsiyani tasodifiy emas, o'ylangan qilib ko'rsatadi.
   */
  const PANEL =
    "rounded-[20px] shadow-[0_30px_60px_-20px_rgba(41,34,30,0.18)]";

  return (
    <section className="relative pt-[var(--header-h)]">
      <div className="hero-pad relative pt-8 sm:pt-10">
        {/* Karta ortidagi iliq nur — soyaga rang beradi, sovuq emas. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 bottom-2 -z-10 h-24 rounded-full bg-gold/25 blur-3xl"
        />

        {/*
          Ramka BUTUN hero bo'limiga: matn va rasm bitta yaxlit kartada
          turadi. Nozik to'q chegara uni krem sahifadan ajratadi, pastga
          yo'nalgan soya esa "ko'taradi".
        */}
        <div
          className={[
            "relative overflow-hidden border border-espresso/20 bg-warm-white",
            "transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
            PANEL,
          ].join(" ")}
        >
          {/* Ichki ingichka oltin chiziq — urg'u, ≤10% oltin qoidasiga mos. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[3] rounded-[20px] ring-1 ring-gold/20 ring-inset"
          />

          {/*
            Ikki ustun BITTA gridda va umumiy vertikal markazda — ular teng
            og'irlikdagi juftlik bo'lib o'qiladi.
          */}
          <div
            ref={stageRef}
            className="relative grid items-center lg:min-h-[clamp(32rem,calc(100dvh-var(--header-h)-6rem),42rem)] lg:grid-cols-2"
          >
        {/* ---------- chap: matn ---------- */}
        <div
          key={slide._id}
          /*
           * Tor ekranda foto matn ostida ALOHIDA blok — shuning uchun
           * matn yo'lagi tekis warm-white bo'lib qoladi.
           *
           * `lg` dan boshlab esa foto butun kartani egallaydi va matn
           * uning USTIDA yotadi: bu yerda fon shaffof bo'lishi shart,
           * aks holda u fotoning chap yarmini butunlay yopib qo'yadi.
           * O'qish uchun asosni `hero-veil` beradi.
           */
          className="relative z-[2] order-1 flex flex-col justify-center bg-warm-white px-6 pt-12 pb-10 sm:px-10 lg:bg-transparent lg:px-[clamp(2.5rem,4vw,4.5rem)] lg:py-16"
        >
          <div className="max-w-[34rem]">
            <p className="inline-block w-fit rounded-full border border-gold/45 px-4 py-1.5 text-[11px] tracking-[0.2em] text-gold-deep uppercase">
              {pick(slide.eyebrow, locale)}
            </p>

            {/* 28px */}
            <SplitHeading
              as="h1"
              cinematic
              label={`${pick(slide.title, locale)} ${pick(slide.accent, locale)}`}
              className="mt-7 text-[clamp(2rem,3.4vw,3.5rem)] leading-[1.12]"
            >
              {pick(slide.title, locale)}
              <br />
              {/*
                Oltin kursiv qator — YORDAMCHI: `0.82em` bilan asosiy
                atamadan kichikroq, aks holda u "Премиум комфорт" ni bosib
                ketardi va ierarxiya buzilardi.
              */}
              <span className="text-[0.82em] text-gold italic">
                {pick(slide.accent, locale)}
              </span>
            </SplitHeading>

            {/* 24px */}
            {/* Tavsif sarlavhadan keyin tiniqlashib chiqadi — hero
                orkestrining uchinchi qadami. */}
            <Reveal
              as="p"
              variant="smoke"
              delay={0.35}
              className="mt-6 max-w-[27.5rem] text-[16px] leading-relaxed text-espresso-soft"
            >
              {pick(slide.text, locale)}
            </Reveal>

            {/* 40px */}
            <div className="mt-10 flex flex-wrap gap-3">
              {slide.ctas.map((cta) => (
                <Button
                  key={cta.href + pick(cta.label, locale)}
                  variant={cta.variant ?? "gold"}
                  size="lg"
                  withArrow={cta.variant === "gold"}
                  onClick={onCta(cta.href)}
                >
                  {pick(cta.label, locale)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- o'ng: ramkalangan rasm paneli ---------- */}
        {/*
          Rasm kartaning o'ng yarmini to'liq egallaydi — karta o'zi
          `overflow-hidden` va yumaloq burchakli, shuning uchun rasm ham
          shu shaklga kesiladi. Nozik to'q chiziq matn bilan rasm orasidagi
          chegarani belgilaydi.
        */}
        <div
          className={[
            "relative order-2 min-w-0 self-stretch",
            "h-[clamp(17rem,58vw,22rem)]",
            /*
             * `lg` da panel gridning ikkinchi katakchasidan CHIQADI va
             * butun kartani qoplaydi — foto chap tomonga ham o'tadi.
             * Grid o'zining `min-h` i bilan balandlikni ushlab turadi,
             * shuning uchun panel oqimdan chiqqani bilan karta pasaymaydi.
             */
            "lg:absolute lg:inset-0 lg:z-0 lg:h-full",
          ].join(" ")}
        >
          <div className="relative h-full overflow-hidden">
          <div className="embla h-full overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {slides.map((s, i) => (
                <div
                  key={s._id}
                  data-slide={i}
                  className="embla__slide relative h-full min-w-0 flex-[0_0_100%]"
                  aria-roledescription="slide"
                  aria-label={t("goToSlide", { index: i + 1 })}
                >
                  <div data-frame className="absolute inset-0 overflow-hidden">
                    {/* Uch qatlam, har birining bitta "egasi": frame → GSAP
                        clip-path, parallax → GSAP quickTo, kenburns → CSS
                        animatsiya. Hech qaysi xossa ikki tizim tomonidan
                        yozilmaydi (§10). */}
                    <div data-parallax className="absolute inset-[-3%]">
                      {/* `relative` MAJBURIY: `transform` qo'llangan element
                          absolyut bolalari uchun yangi konteyner blokka
                          aylanadi — usiz animatsiya boshlanganda `fill`
                          rasmining tayanchi o'zgarib, CLS beradi. */}
                      <div
                        data-kenburns
                        className={`relative size-full ${
                          i === selected && !reduced ? "animate-kenburns" : ""
                        }`}
                      >
                        <Image
                          src={s.image.src}
                          alt={pick(s.image.alt, locale)}
                          fill
                          quality={IMAGE_QUALITY}
                          priority={i === 0}
                          fetchPriority={i === 0 ? "high" : "auto"}
                          {...(i === 0 ? { "data-hero-lcp": "" } : {})}
                          sizes="100vw"
                          {...mediaFit(s.image)}
                          style={mediaFit(s.image).style}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*
            Parda: foto butun kartani egallaydi, matn esa uning chap
            yarmida yotadi — parda o'sha yo'lakni o'qilarli qiladi va
            o'ngga borib butunlay so'nadi (foto yorqinligi saqlanadi).
          */}
          <div
            aria-hidden="true"
            className="hero-veil pointer-events-none absolute inset-0 z-[2] hidden lg:block"
          />
          <div
            aria-hidden="true"
            className="hero-veil-glow pointer-events-none absolute inset-0 z-[2] hidden lg:block"
          />
          {/* Mobilda chok tepada — rasm matn blokidan keyin keladi. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 bg-gradient-to-b from-warm-white to-transparent lg:hidden"
          />

          {/* ---------- pagination (panel ichida) ---------- */}
          <ol className="absolute right-4 bottom-4 z-[2] flex items-center gap-3 rounded-full bg-warm-white/95 px-3.5 py-2 backdrop-blur-sm sm:right-6 sm:gap-4 lg:bottom-24">
            {slides.map((s, i) => (
              <li key={s._id}>
                <button
                  type="button"
                  onClick={() => embla?.scrollTo(i)}
                  aria-label={t("goToSlide", { index: i + 1 })}
                  aria-current={i === selected ? "true" : undefined}
                  className="group flex items-center gap-2"
                >
                  <span
                    className={[
                      "font-display text-sm tabular-nums transition-colors duration-500",
                      // Panel foto USTIDA turadi: foto to'q bo'lsa yarim-shaffof
                      // sirt ham qorayadi. Shuning uchun zaxirali ranglar —
                      // `gold-deep`/`taupe-text` bu yerda 3.9:1 va 4.1:1 edi.
                      i === selected
                        ? "text-gold-ink"
                        : "text-espresso-soft group-hover:text-espresso",
                    ].join(" ")}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className={[
                      "block h-px transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                      i === selected ? "w-9 bg-gold" : "w-4 bg-taupe/60",
                    ].join(" ")}
                  />
                </button>
              </li>
            ))}
          </ol>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/*
        ---------- "ko'prik" kartasi ----------
        Rasm paneli bilan bir xil radius va soya. Deraza chekkalariga
        tegmaydi (`hero-pad`), hero pastiga biroz minadi va keyingi
        bo'limga 40px kiradi — shu bilan ikki blokni bog'laydi.
      */}
      <div className="hero-pad relative z-20 -mt-6 -mb-10 lg:-mt-10">
        {/*
          To'rt element ALOHIDA kartalar: hero kartasi bilan bir oilada
          (o'sha radius oilasi, o'sha to'q hairline), ammo mustaqil
          bo'laklar bo'lib o'qiladi.
        */}
        {/*
          BITTA yaxlit "poydevor", to'rtta alohida quti emas.
          Ilgari bu yerda to'rtta mustaqil karta turardi: har birining
          ichi asosan bo'sh edi (matn chapda, o'ng yarmi havo) va ular
          hero kartasi ostida tasodifiy sochilgandek ko'rinardi.

          Endi ular bitta sirtning bo'laklari: ajratuvchi chiziqlar —
          `gap-px` orqali ostidagi fon ko'rinishi (har qanday panjarada,
          ham gorizontal ham vertikal, aynan 1px va aynan bir xil).
        */}
        <ul
          ref={trustRef}
          className={[
            "grid grid-cols-2 gap-px overflow-hidden rounded-2xl lg:grid-cols-4",
            "border border-espresso/12 bg-espresso/10",
            "shadow-[0_18px_36px_-22px_rgba(41,34,30,0.22)]",
          ].join(" ")}
        >
          {trust.map((item, i) => (
            /*
              Fon va hover BO'LAKDA, harakat esa uning ICHIDAGI mazmunda:
              agar `li` ning o'zi surilsa, ostidagi ajratuvchi fon
              lahzaga ochilib, chiziqlar "yaltirab" ketardi.
            */
            <li
              key={item._id}
              className="group bg-warm-white transition-colors duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:bg-alabaster"
            >
              {/*
                Telefonda panjara ikki ustunli, ya'ni bo'lak ~170px:
                ikon va yorliq yonma-yon turganda matnga 110px qoladi va
                "Yetkazish va o'rnatish" uch qatorga bo'linib ketadi.
                Shuning uchun tor ekranda ikon MATN USTIDA — bo'lak ham
                muvozanatli, ham baland bo'lmaydi.
              */}
              <span
                data-trust-item
                className="flex flex-col items-center gap-2.5 px-3 py-5 text-center sm:flex-row sm:justify-center sm:gap-3.5 sm:px-5 sm:py-6 sm:text-start"
              >
                {/* Ikon oltin halqa ichida — bo'limlar bo'ylab takrorlanadigan
                    "medalyon" shakli; oltin faqat shu yerda, ≤10% qoidasi. */}
                <span
                  className={[
                    "grid size-9 shrink-0 place-items-center rounded-full text-gold sm:size-10",
                    "border border-gold/25 bg-gold/[0.06]",
                    "transition-colors duration-500 group-hover:border-gold/55 group-hover:bg-gold/[0.1]",
                  ].join(" ")}
                >
                  <DrawIcon immediate name={item.icon} size={18} delay={0.7 + i * 0.1} />
                </span>
                <span className="text-[14px] leading-snug font-medium text-espresso">
                  {pick(item.label, locale)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
