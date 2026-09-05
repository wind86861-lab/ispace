"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_LUX } from "@/lib/motion";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ReactNode;
};

/**
 * Bitta forma maydoni: suzuvchi label, oltin fokus chegarasi va
 * xatoning inline ko'rinishi (§8).
 *
 * Label CSS bilan suzadi (`peer-placeholder-shown`) — JS holati kerak emas,
 * shuning uchun avtoto'ldirish va parol menejerlari bilan ham to'g'ri ishlaydi.
 */
export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, error, icon, className = "", id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-taupe-text"
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          // `placeholder=" "` — suzuvchi label `:placeholder-shown` ga tayanadi.
          placeholder=" "
          className={[
            "peer h-14 w-full rounded-xl border bg-warm-white pt-5 pb-2 text-sm text-espresso",
            "transition-colors duration-300 outline-none",
            icon ? "pr-4 pl-11" : "px-4",
            error
              ? "border-red-400/70 focus:border-red-500"
              : "border-taupe/45 hover:border-taupe focus:border-gold",
          ].join(" ")}
          {...rest}
        />

        <label
          htmlFor={inputId}
          className={[
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-taupe-text",
            "transition-all duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
            icon ? "left-11" : "left-4",
            // Bo'sh va fokussiz — markazda; aks holda yuqoriga suzadi.
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm",
            "peer-focus:top-4 peer-focus:text-[12px] peer-focus:tracking-[0.06em] peer-focus:text-gold-deep",
            "peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[12px]",
            "peer-[:not(:placeholder-shown)]:tracking-[0.06em]",
          ].join(" ")}
        >
          {label}
        </label>
      </div>

      {error && (
        <motion.p
          id={errorId}
          role="alert"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: [0, -5, 5, -3, 3, 0] }}
          transition={{ duration: DUR.ui, ease: EASE_LUX }}
          className="mt-1.5 pl-1 text-xs text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});
