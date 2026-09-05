"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import type { Branch } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE_LUX, TRIGGER_START } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import map from "@/content/map/uzbekistan.json";

/** Shu masofadan yaqin nuqtalar bitta klaster deb qaraladi (viewBox birligi). */
const CLUSTER_RADIUS = 28;
/** Klasterdagi nuqtalar markazdan qancha yoyiladi. */
const FAN_RADIUS = 19;

type Pin = { branch: Branch; x: number; y: number };

/**
 * Yaqin joylashgan filiallarni (masalan Toshkentdagi ikkitasi) klasterga
 * yig'ib, ularni markaz atrofida yoyadi. Aks holda ikki nuqta bir-birining
 * ustiga tushib, bittasi bosib bo'lmaydigan bo'lib qoladi.
 */
function layoutPins(branches: Branch[]): Pin[] {
  const raw = branches
    .map((branch) => ({ branch, ...(map.cities as Record<string, { x: number; y: number }>)[branch.mapId] }))
    .filter((p): p is Pin => Number.isFinite(p.x) && Number.isFinite(p.y));

  const clusters: Pin[][] = [];
  for (const pin of raw) {
    const near = clusters.find((c) =>
      c.some((p) => Math.hypot(p.x - pin.x, p.y - pin.y) < CLUSTER_RADIUS),
    );
    if (near) near.push(pin);
    else clusters.push([pin]);
  }

  return clusters.flatMap((cluster) => {
    if (cluster.length === 1) return cluster;

    const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
    const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;

    return cluster.map((pin, i) => {
      const angle = (i / cluster.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...pin,
        x: cx + Math.cos(angle) * FAN_RADIUS,
        y: cy + Math.sin(angle) * FAN_RADIUS,
      };
    });
  });
}

export function Branches({ branches }: { branches: Branch[] }) {
  const t = useTranslations("branches");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();

  const [activeId, setActiveId] = useState(branches[0]._id);
  const svgRef = useRef<SVGSVGElement>(null);

  const pins = useMemo(() => layoutPins(branches), [branches]);
  const active = branches.find((b) => b._id === activeId) ?? branches[0];

  /**
   * Imzo harakati (§10): kontur chizilib chiqadi, so'ng nuqtalar
   * **navbatma-navbat yonadi** va har biridan oltin halqa tarqaladi.
   */
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (reduced || !svg) return;

      const outline = svg.querySelector<SVGPathElement>("[data-outline]");
      const dots = svg.querySelector<SVGPathElement>("[data-dots]");
      const marks = svg.querySelectorAll<SVGGElement>("[data-pin]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg,
          start: TRIGGER_START,
          // Xarita har safar qaytadan chiziladi — bo'lim ko'ringanda
          // effekt takrorlanadi, bir marta emas.
          toggleActions: "restart none none reset",
        },
      });

      if (outline) tl.fromTo(outline, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power2.inOut" });
      if (dots) tl.fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" }, 0.5);

      tl.fromTo(
        marks,
        { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
        { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2)", stagger: 0.14 },
        1.1,
      );

      // Halqa har nuqtadan navbat bilan tarqaladi va shu holda takrorlanadi.
      tl.fromTo(
        svg.querySelectorAll("[data-ripple]"),
        { scale: 0.6, opacity: 0.6, transformOrigin: "50% 50%" },
        {
          scale: 2.6,
          opacity: 0,
          duration: 2.2,
          ease: "power2.out",
          stagger: { each: 0.35, repeat: -1, repeatDelay: 1.1 },
        },
        1.3,
      );
    },
    { scope: svgRef, dependencies: [reduced] },
  );

  return (
    <section id="branches" className="scroll-mt-28 py-20 sm:py-24">
      <div className="container-lux">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle", { count: branches.length })}
        />

        {/*
          `min-w-0` grid ustunlarida MAJBURIY: grid elementining sukut
          qiymati `min-width: auto`, ya'ni trek eng uzun bolasining
          max-content kengligidan kichrayolmaydi. Filial manzili uzun
          bo'lgani uchun 360px ekranda trek 356px ga cho'zilib, butun
          sahifaga gorizontal scroll qo'shardi (o'lchangan: 376 > 360).
          `truncate` bu holatda yordam bermaydi — u trek kengligi
          hisoblangandan KEYIN ishlaydi.
        */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[28rem_1fr] lg:gap-10">
          {/* ---- filiallar ro'yxati ---- */}
          <div className="min-w-0">
            <Reveal as="p" variant="smoke" className="mb-4 text-[12px] tracking-[0.12em] text-espresso-soft/85 uppercase">
              {t("chooseCity")}
            </Reveal>

            {/* Filiallar ketma-ket chiqadi — ro'yxat "to'ldirilayotgandek". */}
            <Reveal as="ul" stagger={0.07} className="space-y-2">
              {branches.map((branch) => {
                const selected = branch._id === activeId;
                return (
                  <li key={branch._id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(branch._id)}
                      aria-pressed={selected}
                      aria-label={t("selectBranch", {
                        name: `${pick(branch.city, locale)} — ${pick(branch.district, locale)}`,
                      })}
                      className={[
                        "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left",
                        "transition-[border-color,background-color,box-shadow,transform] duration-300",
                        selected
                          ? "border-gold/60 bg-warm-white shadow-[0_16px_36px_-24px_rgba(41,34,30,0.35)]"
                          : "border-taupe/30 bg-warm-white/60 hover:-translate-y-0.5 hover:border-taupe hover:bg-warm-white",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "grid size-11 shrink-0 place-items-center rounded-xl border transition-colors duration-300",
                          selected
                            ? "border-gold/50 bg-gold/10 text-gold-deep"
                            : "border-taupe/40 text-taupe-text",
                        ].join(" ")}
                      >
                        <MapPin size={17} strokeWidth={1.5} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] text-espresso">
                          {pick(branch.city, locale)} — {pick(branch.district, locale)}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-espresso-soft/85">
                          {pick(branch.address, locale)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </Reveal>
          </div>

          {/* ---- xarita ---- */}
          <div className="relative min-w-0 overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white p-4 sm:p-8">
            <svg
              ref={svgRef}
              viewBox={map.viewBox}
              role="img"
              aria-label={t("mapAria")}
              className="h-auto w-full"
            >
              <defs>
                {/* Nuqta-matritsa `pattern` bilan: 1200+ `circle` o'rniga
                    ikkita tugun — bir xil ko'rinish, arzon render. */}
                <pattern id="uz-dots" width="13" height="13" patternUnits="userSpaceOnUse">
                  <circle cx="6.5" cy="6.5" r="2.2" fill="var(--color-taupe)" />
                </pattern>
                <clipPath id="uz-clip">
                  <path d={map.path} />
                </clipPath>
              </defs>

              <rect
                data-dots
                clipPath="url(#uz-clip)"
                x="0"
                y="0"
                width={map.width}
                height={map.height}
                fill="url(#uz-dots)"
                opacity="0.8"
              />

              <path
                data-outline
                d={map.path}
                fill="none"
                stroke="var(--color-rosewood)"
                strokeWidth="1.6"
                strokeLinejoin="round"
                opacity="0.8"
              />

              {pins.map(({ branch, x, y }) => {
                const selected = branch._id === activeId;
                return (
                  <g key={branch._id} data-pin transform={`translate(${x} ${y})`}>
                    <circle
                      data-ripple
                      r="9"
                      fill="none"
                      stroke={selected ? "var(--color-gold)" : "var(--color-rosewood-soft)"}
                      strokeWidth="1.5"
                    />
                    {/* Tanlangan nuqta ostida keng halqa — u boshqalardan
                        aniq ajralib turadi. */}
                    {selected && (
                      <circle r="20" fill="var(--color-gold)" opacity="0.14" />
                    )}
                    <circle
                      r={selected ? 13 : 7}
                      fill={selected ? "var(--color-gold-deep)" : "var(--color-rosewood)"}
                      className="transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]"
                    />
                    <circle r={selected ? 4.5 : 2.8} fill="var(--color-warm-white)" />
                    {/*
                      Nuqtaning o'zi ham bosiladi — bu sichqoncha uchun
                      qulaylik. Klaviatura va ekran o'quvchi uchun aynan
                      shu amal chapdagi ro'yxat tugmalarida bor, shuning
                      uchun bu qatlam `aria-hidden`. SVG `<title>` ataylab
                      ishlatilmaydi: React 19 uni hujjat sarlavhasi deb
                      hoisting qilib, hydration nomuvofiqligini keltiradi.
                    */}
                    <circle
                      r="20"
                      fill="transparent"
                      aria-hidden="true"
                      className="cursor-pointer"
                      onClick={() => setActiveId(branch._id)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* ---- tanlangan filial kartasi ---- */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: DUR.ui, ease: EASE_LUX }}
                className="mt-4 rounded-xl border border-taupe/30 bg-cream p-5 sm:absolute sm:bottom-8 sm:left-8 sm:mt-0 sm:w-72 sm:shadow-lg"
              >
                <p className="font-display text-lg text-espresso">
                  {pick(active.city, locale)} — {pick(active.district, locale)}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-espresso-soft">
                  {pick(active.address, locale)}
                </p>

                <dl className="mt-3 space-y-1.5 text-[13px] text-espresso-soft">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">{t("phone")}</dt>
                    <Phone size={13} strokeWidth={1.5} aria-hidden="true" className="text-taupe-text" />
                    <dd>
                      <a href={`tel:${active.phone.replace(/\D/g, "")}`} className="transition-colors duration-300 hover:text-gold">
                        {active.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">{t("hours")}</dt>
                    <Clock size={13} strokeWidth={1.5} aria-hidden="true" className="text-taupe-text" />
                    <dd>{pick(active.hours, locale)}</dd>
                  </div>
                </dl>

                <a
                  href={active.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-gold-deep transition-colors duration-300 hover:text-espresso"
                >
                  {t("route")}
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
