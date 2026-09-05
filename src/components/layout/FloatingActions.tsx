"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import type { SiteContact } from "@/content/types";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useLenis } from "@/components/providers/LenisProvider";
import { TelegramIcon } from "@/components/ui/icons";

/** Shu masofadan keyin "yuqoriga" tugmasi paydo bo'ladi. */
const SHOW_AFTER = 700;

/** Scroll to'xtagach panel qaytadigan kechikish. */
const IDLE_MS = 220;

/** O'ng chekkadagi suzuvchi tugmalar: Telegram va yuqoriga qaytish. */
export function FloatingActions({ contact }: { contact: SiteContact }) {
  const t = useTranslations("footer");
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER);
      /*
       * Telefonda panel kontent ustundan chetda tura olmaydi: ekran
       * 390px, karta 20px dan 370px gacha, panel esa 326–374px da.
       * Ya'ni u kartaning o'ng chekkasidagi boshqaruvlar — masalan
       * "saralanganlarga qo'shish" yuragi — ustiga tushadi va o'lchov
       * ularning bosish nuqtasi haqiqatan bloklanishini ko'rsatdi.
       *
       * To'qnashuv aynan scroll paytida yuz beradi: karta panel oldidan
       * o'tib ketadi. Shuning uchun panel scroll davomida chekinadi va
       * to'xtagach qaytadi — foydalanuvchi bosmoqchi bo'lgan lahzada
       * panel yo ko'rinmaydi, yo ko'rinib turadi va uning ostiga
       * bosilmaydi. Kattaroq ekranda panel kontent ustunidan tashqarida,
       * shuning uchun u yerda hech narsa o'zgarmaydi (`sm:` variantlari).
       */
      setScrolling(true);
      clearTimeout(idle);
      idle = setTimeout(() => setScrolling(false), IDLE_MS);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={[
        "fixed right-4 bottom-6 z-40 flex flex-col items-center gap-3 sm:right-6",
        "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
        "sm:pointer-events-auto sm:translate-x-0 sm:opacity-100",
        scrolling ? "pointer-events-none translate-x-3 opacity-0" : "translate-x-0 opacity-100",
      ].join(" ")}
    >
      <a
        href={contact.telegram}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Telegram"
        className="grid size-12 place-items-center rounded-full bg-espresso text-cream shadow-lg transition-colors duration-300 hover:bg-gold"
      >
        <TelegramIcon className="size-5" />
      </a>

      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: DUR.micro, ease: EASE_LUX }}
            aria-label={t("toTop")}
            onClick={() => lenis.scrollTo(0, 0)}
            className="grid size-12 place-items-center rounded-full border border-taupe/50 bg-warm-white text-espresso-soft shadow-lg transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            <ArrowUp size={18} strokeWidth={1.6} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
