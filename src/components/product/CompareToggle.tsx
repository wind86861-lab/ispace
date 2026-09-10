"use client";

import { Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { useShop } from "@/store/useShop";

/**
 * Solishtirishga qo'shish — sarlavha yonidagi KICHIK ikon.
 *
 * Ilgari u sotib olish blokining pastida, «Записаться на тест-драйв»
 * bilan yonma-yon to'liq tugma edi. Ikkalasi bir darajadagi harakat
 * emas: test-drayv — sotuvga olib boradigan qadam, solishtirish esa
 * yordamchi belgi ("keyin qaraymen"). Teng tugma sifatida u diqqatni
 * o'ziga tortib, blokni ham cho'zib yuborardi.
 *
 * Nomi yonida turgani mantiqan ham to'g'ri: belgi AYNAN shu mahsulotga
 * tegishli — xuddi saralanganlardagi yurakcha kabi.
 */
export function CompareToggle({ productId }: { productId: string }) {
  const t = useTranslations("compare");
  const toggle = useShop((s) => s.toggleCompare);
  const hydrated = useShop((s) => s.hydrated);
  const inCompare = useShop((s) => s.compare.includes(productId));

  /*
   * `hydrated` gacha holat NEUTRAL chiziladi: server `localStorage` ni
   * bilmaydi va belgilangan ko'rinishni chizsa, mijozda u bir zumda
   * o'zgarib, "sakrash" beradi.
   */
  const on = hydrated && inCompare;

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={on}
      aria-label={on ? t("inCompare") : t("add")}
      title={on ? t("inCompare") : t("add")}
      className={[
        "group grid size-9 shrink-0 place-items-center rounded-full border",
        "transition-[background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
        "hover:scale-110 active:scale-95",
        on
          ? "border-gold-deep bg-gold-deep text-warm-white"
          : "border-taupe/50 text-espresso-soft hover:border-gold hover:text-gold-deep",
      ].join(" ")}
    >
      <Scale size={16} strokeWidth={1.7} aria-hidden="true" />
    </button>
  );
}
