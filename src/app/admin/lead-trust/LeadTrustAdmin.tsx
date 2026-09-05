"use client";

import type { TrustPoint } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { LocaleField, emptyLocaleString } from "../LocaleFields";

/**
 * Ishonch chizig'i — «Не нашли нужный товар?» bandining pastki qatori.
 *
 * Ikonlar KODDA (`IconName`): bu yerda ular chizma emas, belgi — hammasi
 * bir xil qalinlikda va bir xil oltin rangda chizilishi kerak. Yuklangan
 * rasm bu birlikni buzardi.
 */
const ICONS: TrustPoint["icon"][] = [
  "shield", "wrench", "credit-card", "truck",
  "layers", "hand", "headset", "map-pin", "award", "sparkles",
];

export function LeadTrustAdmin({ items }: { items: TrustPoint[] }) {
  return (
    <CollectionAdmin<TrustPoint>
      collection="leadTrust"
      items={items}
      blank={() => ({
        _id: "",
        rank: (items.at(-1)?.rank ?? 0) + 1,
        icon: "shield",
        title: emptyLocaleString(),
        text: emptyLocaleString(),
      })}
      addLabel="Nuqta qo‘shish"
      newTitle="Yangi ishonch nuqtasi"
      editTitle="Ishonch nuqtasini tahrirlash"
      confirmText={(i) => `«${i.title.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <>
          <span className="block text-sm text-espresso">{i.title.ru}</span>
          <span className="mt-1 block text-[12px] text-espresso-soft">{i.text.ru}</span>
          <span className="mt-1 block text-[11px] text-espresso-soft/85">{i.icon}</span>
        </>
      )}
      renderFields={(d, set) => (
        <>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-espresso">Ikon</label>
            <select
              value={d.icon}
              onChange={(e) => set({ ...d, icon: e.target.value as TrustPoint["icon"] })}
              className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
            >
              {ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </div>

          <LocaleField
            label="Sarlavha (masalan «Rasmiy kafolat»)"
            value={d.title}
            onChange={(title) => set({ ...d, title })}
          />
          <LocaleField
            label="Izoh (bir qator, masalan «1 yildan 5 yilgacha»)"
            value={d.text}
            onChange={(text) => set({ ...d, text })}
          />

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-espresso">Tartib</label>
            <input
              type="number"
              value={d.rank}
              onChange={(e) => set({ ...d, rank: Number(e.target.value) })}
              className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
            />
            <p className="mt-1.5 text-[11px] text-espresso-soft/85">
              Chiziqda uchtasi yonma-yon turadi. To‘rtinchisi ikkinchi qatorga tushadi — matnlar
              qisqa bo‘lsin.
            </p>
          </div>
        </>
      )}
    />
  );
}
