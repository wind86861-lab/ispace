import type { Feature } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { FEATURE_ICONS } from "@/components/ui/icons";

/**
 * Mahsulot xususiyatlari — ikon va qisqa yorliq.
 *
 * Joyi: CHAP ustun, galereya ostida. Ilgari ular sotib olish blokining
 * ichida, o'ng ustunda edi va u yerda narx, rang, komplektatsiya va
 * tugmalar bilan bir qatorda navbat kutardi — qaror qabul qilish
 * zanjiriga aloqasi bo'lmagan ma'lumot uni faqat cho'zardi.
 *
 * Rasm ostida esa ular fotoga izoh bo'lib o'qiladi va chap ustunning
 * bo'sh qolgan pastki qismini to'ldiradi.
 */
export function ProductFeatures({
  features,
  locale,
}: {
  features: Feature[];
  locale: Locale;
}) {
  if (features.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-4 border-t border-taupe/30 pt-6">
      {features.map((f) => {
        const Icon = FEATURE_ICONS[f.icon];
        return (
          <li key={f.icon} className="flex items-center gap-2.5">
            <Icon size={24} strokeWidth={1.4} aria-hidden="true" className="shrink-0 text-gold" />
            <span className="text-[14px] leading-snug text-espresso-soft">
              {pick(f.label, locale)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
