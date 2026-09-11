"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { About, TimelinePoint } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { EASE_LUX } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Counter } from "@/components/ui/Counter";

/**
 * Sahifa boshi — va ayni paytda kompaniya tarixi.
 *
 * MIXLASH. Blok ekranga to'lganda sahifa butunlay to'xtaydi: keyingi
 * aylantirish uni pastga emas, yillar bo'ylab oldinga suradi.
 *
 * Blokning o'lchamiga TEGILMAYDI: u o'z tabiiy balandligida qoladi.
 * Uni ekran balandligiga cho'zib, kontentni markazga qo'yish tepada
 * katta bo'sh joy qoldirardi.
 *
 * MATN. Har yilning matni bir zumda paydo bo'lmaydi: aylantirilgan
 * sari HARFMA-HARF ochiladi. Har harf tutundan chiqadi (`blur` +
 * `opacity`), ya'ni matn scroll tezligida yozilayotgandek ko'rinadi.
 * Yil to'liq o'qib bo'lingach nuqta pulsatsiya qiladi.
 *
 * Harflar React HOLATI orqali yuritilmaydi. Aks holda har kadrda
 * yuzlab tugunli daraxt qayta chizilardi. O'rniga ular bir marta
 * chiziladi va scroll paytida FAQAT O'ZGARGANLARI to'g'ridan-to'g'ri
 * DOM'da yangilanadi — bir kadrda odatda bir-ikkita harf.
 *
 * TOR EKRAN va harakat kamaytirilgan rejim: pin umuman yo'q, blok
 * oddiy holicha turadi va yillar nuqtalarni bosib ko'riladi.
 */
export function AboutIntro({
  about,
  timeline,
  locale,
  title,
}: {
  about: About;
  timeline: TimelinePoint[];
  locale: Locale;
  title: string;
}) {
  const { reduced } = useMediaTier();
  const root = useRef<HTMLDivElement>(null);

  /** `-1` — umumiy tavsif; `0..n-1` — tarix nuqtalari. */
  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(false);

  /** Matndagi harf tugunlari va oxirgi ochilgan harf soni. */
  const chars = useRef<HTMLElement[]>([]);
  const shownRef = useRef(0);
  /** Oxirgi hisoblangan ochilish nisbati — blok mount bo'lgach kerak. */
  const ratioRef = useRef(1);
  /**
   * Yil to'liq o'qib bo'lindimi — nuqta shunda pulsatsiya qiladi.
   *
   * Pin yo'q bo'lsa matn darrov to'liq ko'rinadi, ya'ni "o'qildi"
   * holati boshidanoq rost.
   */
  const [done, setDone] = useState(true);

  const points = [...timeline].sort((a, b) => a.year - b.year);
  /** Nol nuqta + yillar. */
  const steps = points.length + 1;

  const current = active >= 0 ? points[Math.min(active, points.length - 1)] : null;

  /**
   * Matn blokining kaliti — `data-year` atributi.
   *
   * Umumiy `ref` bu yerda ISHLAMAYDI: crossfade paytida eski va yangi
   * bloklar bir vaqtda DOM'da turadi va bitta `ref` ni bo'lishadi —
   * eskisi unmount bo'lganda uni `null` qilib ketadi. Shundan keyin
   * harflarni bo'yash uchun tugun topilmasdi va matn tutunsiz, birdan
   * to'liq chiqardi. Kalit bo'yicha qidirish doim KERAKLI blokni topadi.
   */
  const keyOf = (i: number) =>
    i >= 0 && points.length > 0 ? points[Math.min(i, points.length - 1)]._id : "intro";
  const stats = current?.stats.length ? current.stats : about.stats;

  const text = current ? pick(current.text, locale) : "";
  const words = text.split(" ");

  /**
   * Matnni `ratio` (0..1) gacha ochadi — to'g'ridan-to'g'ri DOM'da.
   *
   * Harf tugunlari SHU YERDA qayta topiladi, alohida effektda emas.
   * Sabab: matn `AnimatePresence mode="wait"` ichida va yangi blok
   * eskisi so'nib bo'lgandan KEYIN mount qilinadi. Effekt esa yil
   * o'zgargan zahoti ishlaydi — o'sha payt yangi tugunlar hali DOM'da
   * yo'q va ro'yxat bo'sh qolardi. Natijada harflar hech qachon
   * ochilmasdi.
   *
   * Tekshiruv arzon: ro'yxatning birinchi tuguni hamon shu paragraf
   * ichidami? Yo'q bo'lsa — matn almashgan, qayta o'qiymiz.
   */
  const paint = (ratio: number, key: string) => {
    const host = root.current?.querySelector<HTMLElement>(`[data-year="${key}"]`);
    if (!host) return;

    let list = chars.current;
    if (list.length === 0 || !host.contains(list[0])) {
      list = Array.from(host.querySelectorAll<HTMLElement>("[data-ch]"));
      chars.current = list;

      /*
         Yangi matn NOLDAN yoziladi: barcha harflar darrov yashiriladi
         va hisob nolga tushadi. Aks holda ular "allaqachon ochilgan"
         deb hisoblanardi va yozilish umuman ko'rinmasdi.
      */
      for (const el of list) {
        el.style.opacity = "0";
        el.style.filter = "blur(10px)";
      }
      shownRef.current = 0;
    }
    if (list.length === 0) return;

    const to = Math.round(Math.min(1, Math.max(0, ratio)) * list.length);
    const from = shownRef.current;
    if (to === from) return;

    /* Faqat o'zgargan oraliq — bir kadrda odatda bir-ikkita tugun. */
    for (let i = Math.min(from, to); i < Math.max(from, to); i++) {
      const el = list[i];
      if (!el) continue;
      const on = i < to;
      el.style.opacity = on ? "1" : "0";
      el.style.filter = on ? "blur(0px)" : "blur(10px)";
    }
    shownRef.current = to;
  };

  /*
   * Yangi yil kelganda harflar ro'yxati bekor qilinadi — keyingi
   * `paint` chaqiruvi uni o'zi qayta o'qiydi.
   *
   * Effekt HOLATGA tegmaydi (`setState` yo'q): u faqat ref'larni
   * tozalaydi va pin bo'lmagan holatda matnni to'liq ochadi. Aks
   * holda har yil almashinuvida ortiqcha render zanjiri boshlanardi.
   */
  useEffect(() => {
    chars.current = [];
    shownRef.current = 0;

    /*
       Blok endigina mount qilindi — uni DARROV bo'yaymiz.
       `onUpdate` buni qila olmaydi: u yil almashgan lahzada
       ishlaydi, o'shanda yangi blok hali DOM'da yo'q. Agar
       foydalanuvchi shu oraliqda scroll'ni to'xtatsa, keyingi
       chaqiruv umuman kelmasdi va matn tutunsiz, birdan to'liq
       chiqib qolardi.

       Pin yo'q bo'lsa (telefon, reduced-motion) nisbat 1 — matn
       to'liq ko'rinadi.
    */
    paint(pinned ? ratioRef.current : 1, keyOf(active));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id, pinned]);

  useGSAP(
    () => {
      if (reduced || points.length === 0 || !root.current) return;
      if (window.matchMedia("(max-width: 1023px)").matches) return;

      const fill = root.current.querySelector<HTMLElement>("[data-fill]");

      /*
        Sayt sarlavhasi FIXED va hamma narsaning ustida suzadi.
        `start: "top top"` esa blokning tepasini EKRAN tepasiga
        tenglashtiradi — natijada blokning yuqori qismi sarlavha ostiga
        kirib ketadi va ko'rinmaydi. Shuning uchun pin sarlavha
        balandligicha pastdan boshlanadi.
      */
      const headerH = () => {
        const el = document.documentElement;
        // O'zgaruvchi `rem` da yozilgan (`5.5rem`) — uni PIKSELGA
        // o'girmasak, `parseFloat` 5.5 ni qaytaradi va sarlavha
        // deyarli hisobga olinmay qolardi.
        const css = getComputedStyle(el);
        const raw = css.getPropertyValue("--header-h").trim();
        const n = Number.parseFloat(raw);
        if (!Number.isFinite(n)) return 88;
        return raw.endsWith("rem") ? n * (Number.parseFloat(css.fontSize) || 16) : n;
      };

      /*
        Himoya chegarasi. Blok balandligi yuqorida CSS bilan ekranga
        bog'langani uchun odatda bu shart bajariladi. Lekin juda past
        oynada (`max(38rem, …)` ning quyi chegarasi ishlaganda) blok
        ekrandan baland bo'lib qoladi — o'shanda mixlash kesilgan
        kontentni beradi. Bunday holatda mixlamaymiz: oddiy scroll
        noqulay, ko'rinmaydigan yarim blok esa yaroqsiz.
      */
      if (root.current.offsetHeight > window.innerHeight - headerH()) return;

      setPinned(true);

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: () => `top top+=${headerH()}`,
        // Har qadamga bitta ekran balandligi — o'qishga yetarli vaqt.
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const raw = self.progress * steps;
          const step = Math.min(steps - 1, Math.floor(raw));
          const local = raw - step; // 0..1 — qadam ichidagi holat

          setActive((prev) => (prev === step - 1 ? prev : step - 1));

          /*
             Matn qadamning DASTLABKI 70% ida to'liq ochiladi: qolgan
             30% o'qish uchun tinch pauza bo'lib qoladi.
          */
          const ratio = Math.min(1, local / 0.7);
          ratioRef.current = ratio;
          paint(ratio, keyOf(step - 1));
          setDone((prev) => (prev === (ratio >= 1) ? prev : ratio >= 1));

          /*
             Chiziqning to'lgan qismi to'g'ridan-to'g'ri DOM'ga
             yoziladi: u har kadrda o'zgaradi va holat orqali
             yuritilsa sahifa har kadrda qayta chizilardi.
          */
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
      });

      return () => {
        st.kill();
        setPinned(false);
      };
    },
    { scope: root, dependencies: [reduced, steps] },
  );

  const yearImage = current?.image.uploaded === true ? current.image : null;
  const fallback = about.gallery.find((m) => m.uploaded === true);
  const media = yearImage ?? fallback ?? null;

  return (
    /*
      Blok o'z tabiiy balandligida qoladi — `h-screen` yoki vertikal
      markazlashtirish YO'Q. Ular pin paytida tepada katta bo'sh joy
      qoldirardi va joylashuvni o'zgartirardi.
    */
    <div
      ref={root}
      /*
        Katta ekranda blok balandligi EKRANGA bog'lanadi, mazmunga
        emas. Ilgari u tabiiy balandligida o'sib ketardi va mixlanganda
        pastki qismi — chiziq va raqamlar — ekrandan chiqib qolardi;
        scroll esa mixlangani uchun ularni ko'rsata olmasdi.

        `100svh` — telefon va planshetdagi yig'iladigan panel bilan
        birga o'zgaradigan haqiqiy balandlik; `--header-h` — suzib
        turgan sarlavha. `max(38rem, …)` — juda past oynada blok
        siqilib ketmasligi uchun quyi chegara: bunday holatda u
        ekrandan baland bo'lib qoladi va quyidagi tekshiruv mixlashni
        umuman o'chiradi.
      */
      className="lg:flex lg:h-[max(38rem,calc(100svh-var(--header-h)-1.75rem))] lg:flex-col"
    >
      <div className="grid gap-10 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_minmax(0,42rem)] lg:items-center lg:gap-12 xl:gap-16">
        <div>
          <p className="inline-block rounded-full border border-taupe/45 px-3.5 py-1.5 text-[11px] tracking-[0.16em] text-espresso-soft/85 uppercase">
            {pick(about.eyebrow, locale)}
          </p>

          <SplitHeading
            as="h1"
            label={title}
            className="mt-5 text-[clamp(2rem,4vw,3.25rem)] leading-[1.08]"
          >
            {title}
          </SplitHeading>

          {/*
            `min-h` — matn uzunligi yildan yilga farq qiladi; usiz blok
            har almashinuvda balandligini o'zgartirib, ostidagi raqamlar
            va chiziqni sakratardi.
          */}
          {/*
            Ikki matn BITTA grid katagida turadi.

            `mode="wait"` YO'Q: kutish rejimida yangi matn eskisi
            so'nib bo'lgandan keyin DOM'ga tushardi va foydalanuvchi
            shu oraliqda scroll'ni to'xtatsa, harflarni ochadigan
            chaqiruv umuman kelmasdi — matn tutunsiz, birdan to'liq
            paydo bo'lardi. Endi ikkalasi bir vaqtda: eskisi tutunga
            qaytadi, yangisi tutundan chiqadi.

            ABSOLYUT joylashuv emas, GRID. Ilgari bolalar
            `absolute inset-0` edi va `min-h` dan uzun matn blokdan
            oshib, pastdagi RAQAMLAR ustiga chiqib turardi — o'lchov
            buni tasdiqladi. Bitta grid katagi ham ustma-ust
            joylashtiradi, ham konteynerni eng baland bolaga qarab
            cho'zadi: matn hech qachon tashqariga chiqmaydi.
          */}
          <div className="mt-6 grid min-h-[9rem] grid-cols-1">
            <AnimatePresence initial={false}>
              <motion.div
                key={current?._id ?? "intro"}
                data-year={current?._id ?? "intro"}
                className="col-start-1 row-start-1"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE_LUX }}
              >
                {current ? (
                  <>
                    <p className="font-display text-[17px] tracking-[0.18em] text-gold-deep">
                      {current.year}
                    </p>
                    <h2 className="font-display mt-2.5 text-[clamp(1.5rem,2.9vw,2.15rem)] leading-[1.15] text-espresso">
                      {pick(current.title, locale)}
                    </h2>

                    {/* Harfma-harf ochilish — izohi komponent boshida. */}
                    <p className="measure mt-4 text-[18px] leading-relaxed text-espresso-soft">
                      {/*
                        So'z butun bo'lib o'raladi (`inline-block`):
                        harflar alohida tugun bo'lgani uchun usiz satr
                        so'z o'rtasidan uzilib ketardi.
                      */}
                      {words.map((w, wi) => (
                        <span key={`${current._id}-w${wi}`} className="inline-block">
                          {[...w].map((ch, ci) => (
                            <span
                              key={ci}
                              data-ch
                              className="transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]"
                            >
                              {ch}
                            </span>
                          ))}
                          {wi < words.length - 1 ? "\u00A0" : ""}
                        </span>
                      ))}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    {about.paragraphs.map((p, i) => (
                      <p key={i} className="measure text-[18px] leading-relaxed text-espresso-soft">
                        {pick(p, locale)}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---------- raqamlar: har yilga o'ziniki ---------- */}
          <div className="mt-8 grid min-h-[4.5rem] grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?._id ?? "intro-stats"}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: EASE_LUX }}
                className="contents"
              >
                {stats.map((stat) => (
                  <div key={stat._id} className="border-s border-taupe/40 ps-4">
                    <Counter
                      value={stat.value}
                      suffix={stat.suffix}
                      /* `2007` yil bo'lib qolsin, "2 007" emas. */
                      grouped={stat.value > 9999}
                      className="font-display text-[clamp(1.5rem,2.9vw,2.1rem)] leading-none text-gold-deep"
                    />
                    <p className="mt-2 text-[14px] leading-snug text-espresso-soft">
                      {pick(stat.label, locale)}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- o'ngdagi rasm: yil bilan almashadi ---------- */}
        {/*
          Telefonda nisbat bo'yicha, katta ekranda esa ustun bo'yicha:
          `self-stretch` `items-center` ni faqat shu katak uchun bekor
          qiladi, matn ustuni esa markazda qolaveradi. Shu tufayli rasm
          qancha joy qolsa — shuncha katta bo'ladi va hech qachon
          blokni cho'zib yubormaydi.
        */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-auto lg:h-full lg:self-stretch border border-taupe/25 bg-cream shadow-[0_34px_70px_-30px_rgba(41,34,30,0.4)]">
          <AnimatePresence initial={false}>
            {media ? (
              <motion.div
                key={media.src}
                initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_LUX }}
                className="absolute inset-0"
              >
                <Image
                  src={media.src}
                  alt={pick(media.alt, locale)}
                  fill
                  quality={IMAGE_QUALITY}
                  priority
                  sizes="(max-width: 1024px) 100vw, 42rem"
                  style={mediaFit(media).style}
                  className={mediaFit(media).className}
                />
              </motion.div>
            ) : (
              /* Hech qanday rasm yo'q — bo'sh ramka o'rniga yil raqami. */
              <motion.span
                key={`no-media-${current?._id ?? "intro"}`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display absolute inset-0 grid place-items-center text-[clamp(3rem,7vw,5rem)] text-taupe/50"
              >
                {current?.year ?? ""}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---------- yillar chizig'i: BUTUN KENGLIKDA ---------- */}
      {points.length > 0 && (
        <div className="relative mt-9 lg:mt-10 lg:shrink-0">
          {/*
            Yo'lakcha nuqtalarning MARKAZIDAN o'tadi: nuqta 20px, ya'ni
            markaz 10px da. Chiziq 2px bo'lgani uchun u `top-[9px]` ga
            qo'yiladi — usiz u nuqtalarni kesib o'tgandek ko'rinardi.
          */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[9px] h-0.5 rounded-full bg-taupe/45"
          />
          <span
            data-fill
            aria-hidden="true"
            className="absolute inset-x-0 top-[9px] h-0.5 origin-left rounded-full bg-gradient-to-r from-gold to-gold-deep shadow-[0_0_14px_-3px_var(--color-gold-deep)]"
            style={{ transform: `scaleX(${pinned ? 0 : 1})` }}
          />

          <ul className="relative flex items-start justify-between">
            {points.map((p, i) => {
              const on = i === active;
              const passed = i <= active;
              return (
                <li key={p._id} className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={on ? "true" : undefined}
                    aria-label={String(p.year)}
                    className="group relative grid size-5 place-items-center"
                  >
                    {/*
                      Faol nuqtadan tarqaladigan halqa. `scale` va
                      `opacity` — ikkalasi ham kompozitor xossalari,
                      ya'ni scroll paytida qayta joylashuv bo'lmaydi.
                    */}
                    {on && !reduced && (
                      <motion.span
                        key={`halo-${p._id}-${done}`}
                        aria-hidden="true"
                        initial={{ scale: 0.6, opacity: 0.55 }}
                        animate={{ scale: 2.4, opacity: 0 }}
                        transition={{ duration: 1.1, ease: EASE_LUX }}
                        className="absolute inset-0 rounded-full bg-gold/60"
                      />
                    )}

                    {/*
                      Nuqta yilga YETGANDA emas, matn O'QIB BO'LINGANDA
                      pulsatsiya qiladi — harakat "yakunlandi" degan
                      ma'no beradi.
                    */}
                    <motion.span
                      key={`${p._id}-${on && done}`}
                      animate={on && done && !reduced ? { scale: [1, 1.45, 1.15] } : { scale: 1 }}
                      transition={{ duration: 0.55, times: [0, 0.45, 1], ease: EASE_LUX }}
                      className={[
                        "relative block size-5 rounded-full ring-4 ring-cream",
                        "transition-[background-color,box-shadow] duration-500",
                        passed
                          ? "bg-gold-deep shadow-[0_0_16px_-3px_var(--color-gold-deep)]"
                          : "bg-taupe",
                      ].join(" ")}
                    >
                      {/* Ichki oq yadro — nuqta "medalyon" bo'lib ko'rinadi. */}
                      <span
                        aria-hidden="true"
                        className={[
                          "absolute inset-[5px] rounded-full transition-colors duration-500",
                          passed ? "bg-warm-white" : "bg-cream",
                        ].join(" ")}
                      />
                    </motion.span>
                  </button>

                  <motion.span
                    animate={on && done && !reduced ? { scale: [1, 1.22, 1] } : { scale: 1 }}
                    transition={{ duration: 0.55, ease: EASE_LUX }}
                    className={[
                      "font-display text-[17px] tabular-nums transition-colors duration-500",
                      on ? "text-gold-deep" : passed ? "text-espresso" : "text-taupe-text",
                    ].join(" ")}
                  >
                    {p.year}
                  </motion.span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
