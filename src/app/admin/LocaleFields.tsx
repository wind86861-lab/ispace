"use client";

import { useId, useState } from "react";
import type { LocaleString } from "@/content/types";
import { locales, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = { ru: "Русский", uz: "O‘zbekcha", en: "English" };

export const emptyLocaleString = (): LocaleString => ({ ru: "", uz: "", en: "" });

/**
 * Uch tilli matn maydoni.
 *
 * Tillar ilova (tab) bilan almashadi, hammasi bir vaqtda ko'rsatilmaydi:
 * mahsulot formasida o'nlab maydon bor, har birini uch marta chizish
 * formani o'qib bo'lmas holga keltirardi.
 *
 * To'ldirilmagan til ilovasida nuqta turadi — foydalanuvchi qaysi tilni
 * unutganini ilovaga bosmasdan ko'radi. Uchala til ham majburiy, chunki
 * sayt uch tilda ishlaydi va bo'sh maydon o'sha tilda bo'shliq bo'lib
 * chiqardi.
 */
export function LocaleField({
  label,
  value,
  onChange,
  multiline = false,
  required = true,
}: {
  label: string;
  value: LocaleString;
  onChange: (next: LocaleString) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const [active, setActive] = useState<Locale>("ru");
  const id = useId();

  const set = (l: Locale, v: string) => onChange({ ...value, [l]: v });
  const cls =
    "w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none transition-colors duration-300 focus:border-gold";

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <label htmlFor={`${id}-${active}`} className="text-[13px] font-medium text-espresso">
          {label}
        </label>

        <div role="tablist" aria-label={`${label} — til`} className="flex gap-1">
          {locales.map((l) => {
            const on = l === active;
            const filled = value[l].trim().length > 0;
            return (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(l)}
                title={LABELS[l]}
                className={[
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors duration-300",
                  on ? "bg-gold/15 text-gold-ink" : "text-espresso-soft/85 hover:text-espresso",
                ].join(" ")}
              >
                {l.toUpperCase()}
                {required && !filled && (
                  <span
                    aria-label="to‘ldirilmagan"
                    className="size-1.5 rounded-full bg-rosewood-soft"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {multiline ? (
        <textarea
          id={`${id}-${active}`}
          rows={4}
          value={value[active]}
          onChange={(e) => set(active, e.target.value)}
          className={`${cls} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={`${id}-${active}`}
          type="text"
          value={value[active]}
          onChange={(e) => set(active, e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}

/** Oddiy (bir tilli) maydon — forma bo'ylab bir xil ko'rinish uchun. */
export function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  ...rest
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-espresso">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none transition-colors duration-300 focus:border-gold"
        {...rest}
      />
      {hint && <p className="mt-1 text-[11px] text-espresso-soft/85">{hint}</p>}
    </div>
  );
}
