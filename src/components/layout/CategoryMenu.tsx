"use client";

import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import type { Category } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { t as pick } from "@/lib/locale";
import { ICONS } from "@/components/ui/icons";
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
  categories: Category[];
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
              const Icon = c.icon ? ICONS[c.icon] : LayoutGrid;
              return (
                <motion.li
                  key={c._id}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.03 * i, ease: EASE_LUX }}
                >
                  <Link
                    href={`/catalog?category=${c.slug}`}
                    onClick={onPick}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-cream"
                  >
                    <span
                      className={[
                        "grid size-9 shrink-0 place-items-center rounded-lg",
                        "border border-gold/25 bg-gold/[0.06] text-gold",
                        "transition-[background-color,border-color,color,transform] duration-300",
                        "group-hover:scale-105 group-hover:border-gold-deep",
                        "group-hover:bg-gold-deep group-hover:text-warm-white",
                      ].join(" ")}
                    >
                      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="text-[14px] leading-snug text-espresso transition-colors duration-300 group-hover:text-gold-ink">
                      {pick(c.title, locale)}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </div>
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
