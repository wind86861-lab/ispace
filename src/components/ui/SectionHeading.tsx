"use client";

import { SplitHeading } from "./SplitHeading";
import { Reveal } from "./Reveal";
import { ScrollText } from "./ScrollText";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  /** To'q fonli bo'limlarda ranglar teskari. */
  tone?: "light" | "dark";
  /**
   * `true` — sarlavha bo'ylab scroll bilan bog'langan oltin yorug'lik
   * yugurib o'tadi. Ataylab kam ishlatiladi: effekt kuchli, har
   * sarlavhada takrorlansa qadrini yo'qotadi.
   */
  sweep?: boolean;
  className?: string;
};

/** Bo'lim sarlavhasi — sayt bo'ylab bir xil ritm va tipografiya. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  sweep = false,
  className = "",
}: Props) {
  const centered = align === "center";

  return (
    <div
      className={[
        centered ? "mx-auto text-center" : "text-left",
        centered ? "max-w-2xl" : "",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <Reveal as="p" y={14}>
          <span
            className={[
              "inline-block rounded-full border px-3.5 py-1.5 text-[11px] tracking-[0.16em] uppercase",
              tone === "dark"
                ? "border-cream/20 text-cream/60"
                : "border-taupe/45 text-espresso-soft/85",
            ].join(" ")}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}

      {sweep ? (
        <ScrollText
          as="h2"
          variant="sweep"
          label={title}
          /*
            `--sweep-base` — yorug'lik yugurmaydigan qismning rangi.
            `background-clip: text` uchun element `color` i shaffof
            bo'ladi, shuning uchun rangni alohida o'zgaruvchida uzatamiz.
          */
          style={
            {
              "--sweep-base": tone === "dark" ? "var(--color-cream)" : "var(--color-espresso)",
            } as React.CSSProperties
          }
          className="mt-4 font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.15]"
        >
          {title}
        </ScrollText>
      ) : (
        <SplitHeading
          label={title}
          className={[
            "mt-4 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.15]",
            tone === "dark" ? "text-cream" : "text-espresso",
          ].join(" ")}
        >
          {title}
        </SplitHeading>
      )}

      {subtitle && (
        <Reveal as="p" variant="smoke" delay={0.12} className={centered ? "mx-auto" : ""}>
          <span
            className={[
              "measure mt-3 block text-sm leading-relaxed",
              centered ? "mx-auto" : "",
              /*
              `/80` — `/65` emas.

              65% charcoal (#2E2E2E) uchun tanlangan edi va o'sha yerda
              yetarli. Rosewood (#7D4047) esa ancha ochiq, shu sabab
              o'sha alfa 3.95:1 ga tushib qoldi (o'lchangan). 80% ikkala
              to'q sirtda ham AA dan yuqori: rosewoodda 5.1:1.
            */
            tone === "dark" ? "text-cream/80" : "text-espresso-soft",
            ].join(" ")}
          >
            {subtitle}
          </span>
        </Reveal>
      )}
    </div>
  );
}
