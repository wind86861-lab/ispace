"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useLenis } from "@/components/providers/LenisProvider";

export type TocItem = { id: string; label: string };

/**
 * Maqola mundarijasi.
 *
 * Ro'yxat qo'lda yozilmaydi — u matndagi `heading` bloklaridan hosil
 * bo'ladi, ya'ni admin sarlavha qo'shsa mundarija o'zi yangilanadi va
 * hech qachon matndan chetga chiqmaydi.
 *
 * Yopiq holatda ochiladi: uzun maqolada mundarija butun ekranni
 * egallab, o'qishni boshlashga xalaqit berardi.
 */
export function PostToc({ items }: { items: TocItem[] }) {
  const t = useTranslations("post");
  const lenis = useLenis();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-taupe/40 bg-warm-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[14px] text-espresso transition-colors duration-300 hover:bg-cream"
      >
        <BookOpen size={16} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-gold" />
        <span className="flex-1">{t("toc")}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`shrink-0 text-espresso-soft transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.reveal, ease: EASE_LUX }}
            className="overflow-hidden"
          >
            <ol className="border-t border-taupe/30 px-4 py-3">
              {items.map((item, i) => (
                <li key={item.id} className="flex gap-3 py-1.5">
                  <span aria-hidden="true" className="text-[13px] tabular-nums text-gold-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      // Lenis momentum scroll'ni boshqaradi; native "sakrash"
                      // uning bilan ziddiyat qiladi. Ofset sukut bo'yicha
                      // sticky header balandligini hisobga oladi.
                      e.preventDefault();
                      lenis.scrollTo(`#${item.id}`);
                    }}
                    className="text-[14px] leading-snug text-espresso-soft transition-colors duration-300 hover:text-gold-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
