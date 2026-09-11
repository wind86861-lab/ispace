"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useMediaTier";
import { useToast, type Toast, type ToastTone } from "@/store/useToast";

/** Xabar shuncha vaqtdan keyin o'zi yo'qoladi. */
const LIFE_MS = 4000;

const ICON: Record<ToastTone, typeof Check> = {
  default: Info,
  success: Check,
  warn: TriangleAlert,
};

const TONE: Record<ToastTone, string> = {
  default: "border-taupe/40 text-espresso",
  success: "border-gold/50 text-espresso",
  warn: "border-rosewood/45 text-espresso",
};

const ICON_TONE: Record<ToastTone, string> = {
  default: "bg-cream text-espresso-soft",
  success: "bg-gold-deep text-warm-white",
  warn: "bg-rosewood text-cream",
};

/**
 * Xabarnomalar ustuni.
 *
 * CHAP tomonda: o'ng chekkada suzuvchi tugmalar (qo'ng'iroq,
 * Telegram, tepaga) turadi va xabar ularni yopib qo'yardi.
 *
 * `aria-live="polite"` — ekran o'quvchi xabarni fokusni uzmasdan
 * o'qiydi. `role="status"` esa uni "holat" deb belgilaydi: bu
 * ogohlantirish emas, tasdiq.
 */
export function Toaster() {
  const toasts = useToast((s) => s.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-6 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:left-6 sm:items-start"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const t = useTranslations("common");
  const dismiss = useToast((s) => s.dismiss);
  const reduced = useReducedMotion();
  const Icon = ICON[toast.tone];

  /*
   * Har xabar O'Z taymerini yuritadi va yo'qolganda uni tozalaydi.
   * Umumiy taymer bo'lsa, ketma-ket kelgan ikkita xabardan biri
   * ikkinchisining vaqtini o'g'irlardi.
   */
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), LIFE_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <motion.div
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: DUR.ui, ease: EASE_LUX }}
      className={[
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-warm-white",
        "px-4 py-3 shadow-[0_18px_44px_-24px_rgba(41,34,30,0.55)] backdrop-blur-sm",
        TONE[toast.tone],
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={`grid size-7 shrink-0 place-items-center rounded-full ${ICON_TONE[toast.tone]}`}
      >
        <Icon size={15} strokeWidth={2} />
      </span>

      <p className="min-w-0 flex-1 text-[14px] leading-snug">{toast.message}</p>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.run();
            dismiss(toast.id);
          }}
          className="shrink-0 text-[13px] font-medium text-gold-deep transition-colors duration-300 hover:text-gold-ink"
        >
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label={t("close")}
        className="grid size-6 shrink-0 place-items-center rounded-full text-taupe-text transition-colors duration-300 hover:bg-cream hover:text-espresso"
      >
        <X size={13} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
