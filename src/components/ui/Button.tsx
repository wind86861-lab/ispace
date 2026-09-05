"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Variant = "gold" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Oq matn oltin fonda: `gold` da 3.1:1 (yetmaydi), `gold-deep` da 5.2:1.
  gold:
    "bg-gold-deep text-warm-white hover:bg-gold-hover active:scale-[0.98] shadow-[0_1px_2px_rgba(41,34,30,0.12)]",
  outline:
    "border border-taupe/70 text-espresso bg-warm-white/60 hover:border-gold hover:text-gold-deep active:scale-[0.98]",
  ghost: "text-espresso-soft hover:text-gold-deep active:scale-[0.98]",
  dark: "bg-espresso text-cream hover:bg-espresso-soft active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[14px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-[16px] gap-2.5",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** O'ngdagi strelka — hover'da oldinga siljiydi. */
  withArrow?: boolean;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "gold", size = "md", withArrow = false, className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[
        "group inline-flex items-center justify-center rounded-full font-medium",
        // `transition-[...]` ataylab tor: `transition-all` layout xossalarini
        // ham animatsiya qilib, scroll paytida keraksiz ish tug'diradi.
        "transition-[background-color,border-color,color,transform,box-shadow] duration-300",
        "ease-[cubic-bezier(0.2,0.7,0.3,1)] disabled:opacity-60 disabled:pointer-events-none",
        "whitespace-nowrap",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
      {withArrow && (
        <ArrowRight
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:translate-x-1"
        />
      )}
    </button>
  );
});
