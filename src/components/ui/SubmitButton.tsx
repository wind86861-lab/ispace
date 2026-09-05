"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import { DUR, EASE_LUX } from "@/lib/motion";

export type SubmitStatus = "idle" | "sending" | "sent";

type Props = {
  status: SubmitStatus;
  labels: { idle: string; sending: string; sent: string };
  className?: string;
  icon?: React.ReactNode;
  /**
   * `true` — tugma to'liq balandlikdagi kvadrat blok bo'lib turadi
   * (maketdagi kabi, ikkita maydon yonida), ikon esa matn ustida.
   */
  square?: boolean;
};

/**
 * Yuborish tugmasi: idle → spinner → oltin "✓" (§8 imzo harakati).
 * Uch holat ham bitta tugmada almashadi, tugma o'lchami sakramaydi.
 */
export function SubmitButton({ status, labels, className = "", icon, square = false }: Props) {
  const busy = status !== "idle";

  return (
    <button
      type="submit"
      disabled={busy}
      aria-live="polite"
      className={[
        "relative flex w-full items-center justify-center overflow-hidden",
        square ? "h-full min-h-[7.5rem] rounded-2xl px-6" : "h-13 gap-2 rounded-full",
        "font-medium transition-colors duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
        status === "sent" ? "bg-espresso text-cream" : "bg-gold-deep text-warm-white hover:bg-gold-hover",
        "disabled:cursor-default",
        className,
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: DUR.micro, ease: EASE_LUX }}
          className={
            square
              ? "flex flex-col items-center gap-2.5 text-center text-sm"
              : "flex items-center gap-2 text-sm"
          }
        >
          {status === "idle" && (
            <>
              {icon}
              {labels.idle}
            </>
          )}
          {status === "sending" && (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              {labels.sending}
            </>
          )}
          {status === "sent" && (
            <>
              <Check size={16} aria-hidden="true" />
              {labels.sent}
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
