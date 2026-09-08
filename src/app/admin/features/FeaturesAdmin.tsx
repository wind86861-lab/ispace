"use client";

import type { FeatureIcon, ProductFeature } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { FEATURE_ICONS } from "@/components/ui/icons";

const ICONS = Object.keys(FEATURE_ICONS) as FeatureIcon[];

/**
 * Xususiyatlar katalogi.
 *
 * Bu yerda xususiyat BIR MARTA ta'riflanadi, mahsulot formasida esa
 * faqat belgilanadi. Ilgari yorliq har mahsulotda qo'lda yozilardi —
 * kichik farq ham («Прогрев» / «Прогрев спины») solishtirish
 * jadvalida ikkita alohida qator berardi va matritsa qurilmasdi.
 */
export function FeaturesAdmin({ items }: { items: ProductFeature[] }) {
  return (
    <CollectionAdmin<ProductFeature>
      collection="productFeatures"
      items={[...items].sort((a, b) => a.rank - b.rank)}
      blank={() => ({ _id: "", icon: "zero-gravity", label: emptyLocaleString(), rank: 100 })}
      addLabel="Xususiyat qo‘shish"
      newTitle="Yangi xususiyat"
      editTitle="Xususiyatni tahrirlash"
      confirmText={(i) =>
        `«${i.label.ru}» o‘chirilsinmi? U yoqilgan mahsulotlardan ham yo‘qoladi.`
      }
      renderRow={(i) => {
        const Icon = FEATURE_ICONS[i.icon];
        return (
          <span className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/[0.06] text-gold">
              <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-espresso">{i.label.ru}</span>
              <span className="mt-0.5 block text-[11px] text-espresso-soft/85">
                {i.label.uz} · {i.icon} · #{i.rank}
              </span>
            </span>
          </span>
        );
      }}
      renderFields={(d, set) => (
        <>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-espresso">Ikon</label>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
              {ICONS.map((ic) => {
                const Icon = FEATURE_ICONS[ic];
                const on = ic === d.icon;
                return (
                  <button
                    key={ic}
                    type="button"
                    title={ic}
                    onClick={() => set({ ...d, icon: ic })}
                    className={[
                      "grid aspect-square place-items-center rounded-xl border transition-colors duration-300",
                      on
                        ? "border-gold-deep bg-gold/12 text-gold-ink"
                        : "border-taupe/40 text-espresso-soft hover:border-gold/50",
                    ].join(" ")}
                  >
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <LocaleField label="Yorliq" value={d.label} onChange={(label) => set({ ...d, label })} />
          <Field
            label="Tartib raqami"
            type="number"
            value={d.rank}
            onChange={(v) => set({ ...d, rank: Number(v) })}
            hint="Kichik raqam oldinroq turadi"
          />
        </>
      )}
    />
  );
}
