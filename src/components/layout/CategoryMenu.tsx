"use client";

import { AnimatePresence, motion } from "motion/react";
import type { IconName, LocaleString } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { t as pick } from "@/lib/locale";
import { categoryIcon } from "@/components/ui/icons";
import { EASE_LUX } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";

/**
 * «Katalog» ostidagi kategoriyalar ro'yxati.
 *
 * Havolalar `?category=` bilan ketadi: katalog sahifasi shu
 * parametrni o'qib, filtrni oldindan qo'yadi. Ya'ni foydalanuvchi
 * avval katalogni ochib, keyin kerakli bo'limni izlashi shart emas.
 *
 * Ro'yxat `AnimatePresence` ichida: yopilishda ham animatsiya bo'ladi.
 * Usiz menyu bir zumda yo'qolib, "sakragandek" tuyulardi.
 */
export function CategoryMenu({
  open,
  categories,
  locale,
  onPick,
}: {
  open: boolean;
  /**
   * FAQAT mahsuloti bor kategoriyalar, har birida soni bilan.
   *
   * Ro'yxat katalog sahifasidagi chiplar bilan bir xil manbadan
   * hisoblanadi: ilgari menyu oltitasini ko'rsatib, katalog esa
   * uchtasini chizardi va foydalanuvchi bo'sh bo'limga tushardi.
   */
  categories: { slug: string; title: LocaleString; icon?: IconName; count: number }[];
  locale: Locale;
  onPick: () => void;
}) {
  const { reduced } = useMediaTier();

  return (
    <AnimatePresence>
      {open && (
        <motion.ul
          /*
           * `pt-3` — sarlavha bilan ro'yxat orasidagi bo'shliq MENYU
           * ichida qoladi. Tashqarida bo'lsa sichqoncha o'sha bo'shliqqa
           * tushganda `mouseleave` ishlab, menyu yopilib ketardi.
           */
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: EASE_LUX }}
          className="absolute top-full left-0 z-30 w-64 pt-3"
        >
          <div className="overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white p-1.5 shadow-[0_24px_50px_-24px_rgba(41,34,30,0.45)]">
            {categories.map((c, i) => {
              const Icon = categoryIcon(c);
              const empty = c.count === 0;

              // Ichki mazmun ikkala tarmoqda ham bir xil.
              const body = (
                <>
                  <span
                    className={[
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      "border border-gold/25 bg-gold/[0.06] text-gold",
                      "transition-[background-color,border-color,color,transform] duration-300",
                      empty
                        ? ""
                        : "group-hover:scale-105 group-hover:border-gold-deep group-hover:bg-gold-deep group-hover:text-warm-white",
                    ].join(" ")}
                  >
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span
                    className={[
                      "flex-1 text-[14px] leading-snug text-espresso transition-colors duration-300",
                      empty ? "" : "group-hover:text-gold-ink",
                    ].join(" ")}
                  >
                    {pick(c.title, locale)}
                  </span>
                  <span className="text-[12px] tabular-nums text-espresso-soft/70">{c.count}</span>
                </>
              );

              const cls = [
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300",
                empty ? "cursor-not-allowed opacity-45" : "hover:bg-cream",
              ].join(" ");
              return (
                <motion.li
                  key={c.slug}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.03 * i, ease: EASE_LUX }}
                >
                  {/*
                    Mahsuloti yo'q bo'lim KO'RINADI, lekin havola emas:
                    ro'yxat adminnikiga mos qoladi va hech kim bo'sh
                    katalogga tushmaydi.
                  */}
                  {empty ? (
                    <span aria-disabled="true" className={cls}>
                      {body}
                    </span>
                  ) : (
                    <Link href={`/catalog?category=${c.slug}`} onClick={onPick} className={cls}>
                      {body}
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </div>
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
