"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaTier } from "@/hooks/useMediaTier";

type Props = {
  children: ReactNode;
  className?: string;
  /** Kursorga ergashish kuchi (0 — umuman, 1 — to'liq). */
  strength?: number;
  /** Ta'sir zonasi elementdan necha px tashqariga chiqadi. */
  padding?: number;
};

/**
 * Magnit hover (§2 — faqat `fine pointer`).
 *
 * Touch qurilmalarda **hech qanday listener qo'shilmaydi**: `pointerFx`
 * false bo'lsa effekt tanasi darrov qaytadi va element oddiy div bo'lib
 * qoladi. Mobil ekvivalenti CSS'da — `:active` dagi nozik `scale`.
 *
 * Tashqi div — sezish zonasi (padding bilan kattalashtirilgan, salbiy
 * margin bilan layout'ga ta'sir qilmaydi), ichkisi — siljiydigan element.
 */
export function Magnetic({ children, className, strength = 0.35, padding = 16 }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const { pointerFx } = useMediaTier();

  useGSAP(
    () => {
      const zone = zoneRef.current;
      const target = targetRef.current;
      if (!pointerFx || !zone || !target) return;

      const xTo = gsap.quickTo(target, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(target, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = target.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerleave", onLeave);

      return () => {
        zone.removeEventListener("pointermove", onMove);
        zone.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: zoneRef, dependencies: [pointerFx, strength] },
  );

  /**
   * `className` **har doim tashqi** elementda: aynan u ota-onaning
   * grid/flex bolasi bo'ladi, ya'ni `lg:row-span-2` kabi joylashuv
   * klasslari o'z joyida ishlaydi. Ichki div faqat transform tashuvchisi.
   * Padding/margin juftligi sezish zonasini kengaytiradi, lekin layout'ga
   * ta'sir qilmaydi — va faqat pointer effekti yoqilganda qo'shiladi.
   */
  return (
    <div
      ref={zoneRef}
      className={className}
      style={pointerFx ? { padding, margin: -padding } : undefined}
    >
      <div
        ref={targetRef}
        className="h-full"
        style={{ willChange: pointerFx ? "transform" : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
