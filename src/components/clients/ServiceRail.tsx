"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import type { ClientService } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { isVideoSrc } from "@/components/ui/SmartMedia";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaTier } from "@/hooks/useMediaTier";
import { motionEnabled } from "@/lib/motion";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { DrawIcon } from "@/components/ui/DrawIcon";
import { MediaViewer } from "@/components/reviews/MediaViewer";
import type { ViewerItem } from "@/components/reviews/media";
import { useUi } from "@/store/useUi";

/**
 * To'rt bo'lim — sahifaning asosiy hikoyasi.
 *
 * KATTA EKRANDA media ustuni YOPISHIB turadi, matn esa uning yonidan
 * o'tadi: bo'lim almashganda rasm joyida qolib, faqat MAZMUNI
 * almashadi — maskadan yangisi ochiladi.
 *
 * Nega aynan shunday: to'rtta blokni ketma-ket qo'yish "pastga tushish"
 * bo'lardi, foydalanuvchi esa ularni bir-biriga bog'lamasdi. Yopishqoq
 * ustun bitta uzluksiz sahna hosil qiladi — scroll bir narsani
 * o'zgartirayotgani ko'rinib turadi.
 *
 * `position: sticky` ATAYLAB — GSAP `pin` emas. Pin sahifa oqimiga
 * o'ram qo'shadi va sarlavha balandligini hisobga olmaydi; sticky esa
 * brauzerning o'z mexanizmi: u hech qachon kesilmaydi va harakat
 * kamaytirilgan holatda ham to'g'ri ishlaydi.
 *
 * Telefonda ustun yo'q — media o'z blokining tepasida, maska bilan
 * ochiladi.
 */
export function ServiceRail({ services }: { services: ClientService[] }) {
  const t = useTranslations("clientsPage");
  const locale = useLocale() as Locale;
  const openOverlay = useUi((s) => s.open);
  const { reduced, pointerFx } = useMediaTier();

  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /** To'liq ekran ko'ruvchidagi element. `null` — yopiq. */
  const [viewer, setViewer] = useState<number | null>(null);

  /*
   * Ko'ruvchi uchun ro'yxat — faqat yuklangan media. Sharhlar uchun
   * yozilgan `MediaViewer` bu yerda ham ishlaydi: u umumiy komponent,
   * sharhga bog'liq hech narsasi yo'q.
   */
  const withMedia = services.filter((s) => s.media.uploaded === true);
  const items: ViewerItem[] = withMedia.map((s) =>
    isVideoSrc(s.media.src)
      ? { kind: "video", media: s.media }
      : { kind: "photo", media: s.media },
  );
  const viewerIndex = (s: ClientService) => withMedia.findIndex((x) => x._id === s._id);

  /*
   * Admin hamma bo'limni o'chirishi mumkin — o'shanda `services[0]`
   * ga murojaat sahifani yiqitardi. Bo'sh ro'yxatda bo'lim umuman
   * chizilmaydi.
   */
  const current = services[active] ?? services[0];

  useGSAP(
    () => {
      if (reduced || !motionEnabled() || !root.current) return;
      /* Yopishqoq ustun faqat katta ekranda — kuzatuv ham o'sha yerda. */
      if (window.matchMedia("(max-width: 1023px)").matches) return;

      const panels = gsap.utils.toArray<HTMLElement>(
        root.current.querySelectorAll("[data-panel]"),
      );
      const fill = root.current.querySelector<HTMLElement>("[data-progress]");

      const triggers = panels.map((panel, i) =>
        ScrollTrigger.create({
          trigger: panel,
          /*
            Ekran O'RTASI chegara: bo'lim matnining yarmi ko'rinib
            turganda media almashadi. Yuqoriroq chegarada rasm matndan
            oldin o'zgarib, "kechikkandek" tuyulardi.
          */
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        }),
      );

      const progress = fill
        ? ScrollTrigger.create({
            trigger: root.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 0.5,
            onUpdate: (self) => {
              fill.style.transform = `scaleY(${self.progress})`;
            },
          })
        : null;

      return () => {
        for (const tr of triggers) tr.kill();
        progress?.kill();
      };
    },
    { scope: root, dependencies: [reduced, services.length] },
  );

  if (services.length === 0) return null;

  return (
    <>
      <div ref={root} className="container-lux lg:grid lg:grid-cols-[1fr_auto_0.9fr] lg:gap-12 xl:gap-16">
        {/* ================= chap: matn bloklari ================= */}
        <div>
          {services.map((s) => (
            <section
              key={s._id}
              id={s.slug}
              data-panel
              /*
                `scroll-mt` — chipdan o'tilganda sarlavha suzib turgan
                header ostiga kirib ketmasligi uchun.
              */
              className="scroll-mt-[calc(var(--header-h)+2rem)] py-14 lg:flex lg:min-h-[86svh] lg:flex-col lg:justify-center lg:py-0"
            >
              {/* --- telefon uchun media: blok tepasida --- */}
              {s.media.uploaded === true && (
                <Reveal variant="mask" className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setViewer(viewerIndex(s))}
                    className="relative mb-7 block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-3xl border border-taupe/25 bg-cream"
                  >
                    <ServiceMedia service={s} locale={locale} />
                  </button>
                </Reveal>
              )}

              <Reveal className="inline-flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl border border-gold/30 bg-gold/[0.07] text-gold">
                  <DrawIcon name={s.icon} size={20} />
                </span>
                <span className="text-[11px] tracking-[0.18em] text-espresso-soft/85 uppercase">
                  {pick(s.eyebrow, locale)}
                </span>
              </Reveal>

              <SplitHeading
                as="h2"
                label={pick(s.title, locale)}
                className="mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1]"
              >
                {pick(s.title, locale)}
              </SplitHeading>

              <Reveal variant="smoke" delay={0.06}>
                <p className="measure mt-4 text-[16px] leading-relaxed text-espresso-soft">
                  {pick(s.lead, locale)}
                </p>
              </Reveal>

              {s.points.length > 0 && (
                <ul className="mt-7 grid gap-3">
                  {s.points.map((pt, j) => (
                    <Reveal key={j} as="li" delay={0.05 + j * 0.05} className="flex items-baseline gap-3.5">
                      {/*
                        Chiziqcha — bandning "belgisi". U CSS o'tishi
                        bilan chapdan o'sadi: har band o'z navbatida
                        joyiga tushgandek ko'rinadi.
                      */}
                      <span
                        aria-hidden="true"
                        className="mt-2 h-px w-6 shrink-0 origin-left bg-gold-deep"
                      />
                      <span className="text-[15px] leading-relaxed text-espresso">
                        {pick(pt, locale)}
                      </span>
                    </Reveal>
                  ))}
                </ul>
              )}

              {s.outro && (
                <Reveal variant="smoke" delay={0.1}>
                  <p className="font-display mt-7 border-s-2 border-gold/45 ps-5 text-[17px] leading-snug text-espresso">
                    {pick(s.outro, locale)}
                  </p>
                </Reveal>
              )}

              <Reveal delay={0.14} className="mt-8">
                <Magnetic strength={0.28}>
                  <Button variant="outline" withArrow onClick={() => openOverlay("consult")}>
                    {t("ask")}
                  </Button>
                </Magnetic>
              </Reveal>
            </section>
          ))}
        </div>

        {/* ================= o'rta: yurish chizig'i ================= */}
        <div className="relative hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+6rem)] flex flex-col items-center">
            <span aria-hidden="true" className="absolute inset-y-0 w-px bg-taupe/30" />
            <span
              data-progress
              aria-hidden="true"
              className="absolute inset-y-0 w-px origin-top scale-y-0 bg-gradient-to-b from-gold to-gold-deep"
            />
            <ul className="flex flex-col gap-8">
              {services.map((s, i) => (
                <li key={s._id}>
                  <span
                    aria-hidden="true"
                    className={[
                      "block size-2.5 rounded-full ring-4 ring-cream transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
                      i === active ? "scale-150 bg-gold-deep" : "bg-taupe/60",
                    ].join(" ")}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ================= o'ng: yopishqoq media ================= */}
        <div className="relative hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+4rem)]">
            <div
              onClick={() => {
                const i = viewerIndex(current);
                if (i >= 0) setViewer(i);
              }}
              className={[
                "group relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-taupe/25 bg-cream",
                "shadow-[0_50px_90px_-50px_rgba(41,34,30,0.55)]",
                current.media.uploaded === true ? "cursor-zoom-in" : "",
              ].join(" ")}
            >
              {services.map((s, i) => (
                <div
                  key={s._id}
                  /*
                    Almashinuv MASKA bilan: yangi media pastdan
                    ochiladi va ayni paytda ozgina kichrayadi.
                    Oddiy `opacity` o'tishi ikki rasmni bir-biriga
                    "iflos" aralashtirardi.
                  */
                  style={{
                    clipPath: i === active ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
                    transform: i === active ? "scale(1)" : "scale(1.06)",
                    transitionDuration: reduced ? "0ms" : "900ms",
                  }}
                  className="absolute inset-0 transition-[clip-path,transform] ease-[cubic-bezier(0.2,0.7,0.3,1)]"
                >
                  {s.media.uploaded === true ? (
                    <ServiceMedia service={s} locale={locale} priority={i === 0} />
                  ) : (
                    /* Media hali yuklanmagan — o'rindosh rasm emas, tipografiya. */
                    <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-greige/70 via-cream to-warm-white">
                      <span className="font-display text-[clamp(2rem,4vw,3rem)] text-taupe/60">
                        {pick(s.eyebrow, locale)}
                      </span>
                    </span>
                  )}
                </div>
              ))}

              {/* Kattalashtirish ishorasi — faqat sichqoncha bor ekranda. */}
              {pointerFx && current.media.uploaded === true && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 bottom-5 inline-flex translate-y-2 items-center gap-2 rounded-full bg-espresso/70 px-4 py-2 text-[12px] text-cream opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <Maximize2 size={13} strokeWidth={1.8} />
                  {t("zoom")}
                </span>
              )}
            </div>

            <p className="mt-4 flex items-center gap-2 text-[12px] text-espresso-soft/85">
              <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
              {pick(current.media.alt, locale)}
            </p>
          </div>
        </div>
      </div>

      <MediaViewer
        items={items}
        index={viewer}
        onIndex={setViewer}
        onClose={() => setViewer(null)}
        locale={locale}
        label={t("title")}
      />
    </>
  );
}

/** Rasm yoki video — kengaytmaga qarab. */
function ServiceMedia({
  service,
  locale,
  priority = false,
}: {
  service: ClientService;
  locale: Locale;
  priority?: boolean;
}) {
  const alt = pick(service.media.alt, locale);

  if (isVideoSrc(service.media.src)) {
    return (
      <video
        src={service.media.src}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
        className="size-full object-cover"
      />
    );
  }

  return (
    <Image
      src={service.media.src}
      alt={alt}
      fill
      priority={priority}
      quality={IMAGE_QUALITY}
      sizes="(max-width: 1024px) 100vw, 40vw"
      style={mediaFit(service.media).style}
      className={`${mediaFit(service.media).className} transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.04]`}
    />
  );
}
