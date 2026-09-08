import { Star } from "lucide-react";

/**
 * Reyting yulduzlari — statik, animatsiyasiz.
 *
 * Bosh sahifadagi karuseldagi variant GSAP bilan "to'ladi", lekin u
 * yerda ekranda bir vaqtda to'rtta karta bo'ladi. Sharhlar sahifasida
 * ular o'nlab: har biriga alohida kuzatuvchi va vaqt chizig'i ochish
 * scroll'ni og'irlashtirardi va hech qanday ma'no qo'shmasdi.
 *
 * `role="img"` MAJBURIY: `aria-label` rolsiz elementda ARIA bo'yicha
 * e'tiborsiz qoldirilishi mumkin, yulduzlar to'plami esa — bitta
 * grafik.
 */
export function Stars({
  rating,
  label,
  size = 14,
}: {
  rating: number;
  label: string;
  size?: number;
}) {
  return (
    <span role="img" aria-label={label} className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.4}
          aria-hidden="true"
          className={i < rating ? "text-gold" : "text-taupe-text/40"}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
