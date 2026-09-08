"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ClientService } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { isVideoSrc } from "@/components/ui/SmartMedia";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaTier } from "@/hooks/useMediaTier";
import { motionEnabled } from "@/lib/motion";
import { useLenis } from "@/components/providers/LenisProvider";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { useUi } from "@/store/useUi";
import { StatRail } from "./StatRail";
import { ICONS } from "@/components/ui/icons";

/**
 * Sahifa boshi — YAGONA sahnalashtirilgan kirish.
 *
 * Hammasi bir vaqtda chiqmaydi. Tartib ataylab shunday:
 *
 *   1. atmosfera (fon dog'lari) — sahna yoritiladi;
 *   2. rasm dastasi chetdan kirib, joyiga tushadi — "nima haqida"
 *      degan savolga birinchi javob rasm bo'lishi kerak;
 *   3. sarlavha qatorlab ochiladi;
 *   4. kirish matni tutundan chiqadi;
 *   5. chiplar ketma-ket;
 *   6. tugma — oxirida, chunki u harakatga chaqiruv: undan oldin
 *      foydalanuvchi nimaga rozi bo'layotganini o'qigan bo'lishi kerak.
 *
 * Keyin sahna JIM turmaydi: dog'lar sekin suriladi, dasta esa
 * sichqonchaga chuqurlik bilan javob beradi.
 */
export function ClientsHero({ services }: { services: ClientService[] }) {
  const t = useTranslations("clientsPage");
  const locale = useLocale() as Locale;
  const lenis = useLenis();
  const openOverlay = useUi((s) => s.open);
  const { reduced, pointerFx } = useMediaTier();

  const root = useRef<HTMLElement>(null);

  /*
   * Dastaga faqat HAQIQATAN yuklangan media tushadi. Bo'sh uya
   * o'rindosh ramka bo'lib turmaydi — media yo'q bo'lsa ustun
   * umuman chizilmaydi va matn butun kenglikni oladi.
   */
  const stack = services.filter((s) => s.media.uploaded === true).slice(0, 3);

  useGSAP(
    () => {
      if (reduced || !motionEnabled() || !root.current) return;
      const q = gsap.utils.selector(root);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1 — atmosfera
      tl.fromTo(
        q("[data-blob]"),
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, duration: 1.3, stagger: 0.12 },
        0,
      );

      // 2 — rasm dastasi: maskadan ochilib, joyiga o'tiradi
      tl.fromTo(
        q("[data-card]"),
        /*
          `rotate` bu yerda YO'Q — ataylab.

          U `from` da berilsa GSAP burchakni 0 ga qo'yadi va `to` da
          qaytarmaydi: kartalar yelpig'ich bo'lib ochilishi o'rniga
          tekis ustma-ust yotib qolardi. Burchak inline uslubda
          turibdi, GSAP unga tegmasligi kerak.
        */
        { opacity: 0, yPercent: 14, clipPath: "inset(0% 0% 100% 0%)" },
        {
          opacity: 1,
          yPercent: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          stagger: 0.13,
        },
        0.2,
      );

      // 4 — kirish matni (3-qadamni `SplitHeading` o'zi bajaradi)
      tl.fromTo(
        q("[data-lead]"),
        { opacity: 0, filter: "blur(12px)", y: 14 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.9 },
        0.75,
      );

      // 5 — chiplar
      tl.fromTo(
        q("[data-chip]"),
        { opacity: 0, y: 12, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06 },
        0.9,
      );

      // 6 — chaqiruv
      tl.fromTo(
        q("[data-cta]"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55 },
        1.15,
      );

      /*
        Uzluksiz harakat: dog'lar sekin "nafas oladi". Bu sahnani
        tirik ushlab turadi, lekin diqqatni tortmaydi — davri uzun
        va amplitudasi kichik.
      */
      const drift = gsap.to(q("[data-blob]"), {
        xPercent: (i) => (i === 0 ? 6 : -7),
        yPercent: (i) => (i === 0 ? -5 : 6),
        duration: 11,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      return () => {
        tl.kill();
        drift.kill();
      };
    },
    { scope: root, dependencies: [reduced, stack.length] },
  );

  /*
   * Sichqoncha ostida dasta CHUQURLIK beradi: oldingi karta ko'proq,
   * orqadagisi kamroq suriladi. `quickTo` har kadrda yangi tween
   * yaratmaydi — harakat yumshoq va arzon.
   */
  useGSAP(
    () => {
      if (!pointerFx || !root.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(
        root.current.querySelectorAll("[data-card]"),
      );
      if (cards.length === 0) return;

      const setters = cards.map((el, i) => ({
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
        depth: (i + 1) * 9,
      }));

      const onMove = (e: PointerEvent) => {
        const r = root.current!.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
        for (const s of setters) {
          s.x(nx * s.depth);
          s.y(ny * s.depth);
        }
      };

      const onLeave = () => {
        for (const s of setters) {
          s.x(0);
          s.y(0);
        }
      };

      const el = root.current;
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root, dependencies: [pointerFx, stack.length] },
  );

  const title = t("title");

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden pt-8 pb-16 lg:pb-20"
    >
      {/* ---- atmosfera: rangli dog'lar parda ostida ---- */}
      <span
        data-blob
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 -z-10 size-[34rem] rounded-full bg-gold/20 blur-[120px]"
      />
      <span
        data-blob
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-24 -z-10 size-[30rem] rounded-full bg-rosewood/14 blur-[130px]"
      />

      <div className="container-lux">
        <div
          className={[
            "grid items-center gap-12",
            stack.length > 0 ? "lg:grid-cols-[1.05fr_0.95fr] lg:gap-16" : "",
          ].join(" ")}
        >
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-taupe/45 bg-warm-white/70 px-3.5 py-1.5 text-[11px] tracking-[0.16em] text-espresso-soft uppercase backdrop-blur-sm">
              {t("eyebrow")}
            </p>

            <SplitHeading
              cinematic
              as="h1"
              label={title}
              delay={0.45}
              className="mt-5 text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.06]"
            >
              {title}
            </SplitHeading>

            <p
              data-lead
              className="measure mt-5 text-[17px] leading-relaxed text-espresso-soft"
            >
              {t("subtitle")}
            </p>

            {/* ---- bo'limlarga tez o'tish ---- */}
            <ul className="mt-8 flex flex-wrap gap-2">
              {services.map((s) => {
                const Icon = ICONS[s.icon];
                return (
                  <li key={s._id} data-chip>
                    <Magnetic strength={0.22}>
                      <button
                        type="button"
                        onClick={() => lenis.scrollTo(`#${s.slug}`)}
                        className="group inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-warm-white/70 py-2.5 pr-4 pl-3 text-[13px] text-espresso-soft backdrop-blur-sm transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink"
                      >
                        <span className="grid size-7 place-items-center rounded-full border border-gold/25 bg-gold/[0.07] text-gold transition-colors duration-300 group-hover:border-gold-deep group-hover:bg-gold-deep group-hover:text-warm-white">
                          <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                        </span>
                        {pick(s.eyebrow, locale)}
                      </button>
                    </Magnetic>
                  </li>
                );
              })}
            </ul>

            <div data-cta className="mt-8">
              <Magnetic strength={0.3}>
                <Button
                  variant="gold"
                  size="lg"
                  withArrow
                  onClick={() => openOverlay("consult")}
                >
                  {t("cta")}
                </Button>
              </Magnetic>
            </div>
          </div>

          {/* ---- rasm dastasi: chuqurlik va qatlamlar ---- */}
          {stack.length > 0 && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
              {stack.map((s, i) => (
                <div
                  key={s._id}
                  data-card
                  /*
                    Kartalar bir-birining ustiga siljib turadi va
                    HAR BIRI o'z burchagida — bu tekis panjaradan
                    ko'ra ko'proq chuqurlik beradi. Burchak kichik:
                    kattasi "kollaj" bo'lib ketardi.
                  */
                  style={{
                    zIndex: stack.length - i,
                    rotate: `${(i - 1) * 3.5}deg`,
                    inset: `${i * 6}% ${i * 5}% ${(stack.length - 1 - i) * 6}% ${(stack.length - 1 - i) * 5}%`,
                  }}
                  className="absolute overflow-hidden rounded-3xl border border-taupe/25 bg-cream shadow-[0_40px_80px_-40px_rgba(41,34,30,0.55)]"
                >
                  {isVideoSrc(s.media.src) ? (
                    <video
                      src={s.media.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-label={pick(s.media.alt, locale)}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Image
                      src={s.media.src}
                      alt={pick(s.media.alt, locale)}
                      fill
                      priority={i === 0}
                      quality={IMAGE_QUALITY}
                      sizes="(max-width: 1024px) 90vw, 40vw"
                      style={mediaFit(s.media).style}
                      className={mediaFit(s.media).className}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <StatRail services={services} />
      </div>
    </section>
  );
}
