import { Star } from "lucide-react";

/**
 * Reyting yulduzchalari.
 *
 * Ko'rinish bezak, ma'no esa matnda: ekran o'quvchi `label` ni o'qiydi,
 * yulduzlarning o'zi `aria-hidden`. Yarim yulduz chizilmaydi — to'ldirish
 * eng yaqin butun songacha yaxlitlanadi.
 */
export function RatingStars({ value, label }: { value: number; label: string }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" title={label}>
      <span className="sr-only">{label}</span>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={1.5}
          aria-hidden="true"
          className={i < filled ? "text-gold" : "text-taupe-text/40"}
          fill={i < filled ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
