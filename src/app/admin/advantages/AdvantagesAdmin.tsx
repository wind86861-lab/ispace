"use client";

import type { Advantage } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { LocaleField, emptyLocaleString } from "../LocaleFields";

const ICONS: Advantage["icon"][] = [
  "shield", "wrench", "credit-card", "truck",
  "layers", "hand", "headset", "map-pin", "award", "sparkles",
];

export function AdvantagesAdmin({ items }: { items: Advantage[] }) {
  return (
    <CollectionAdmin<Advantage>
      collection="advantages"
      items={items}
      blank={() => ({
        _id: "",
        icon: "shield",
        title: emptyLocaleString(),
        text: emptyLocaleString(),
      })}
      addLabel="Afzallik qo‘shish"
      newTitle="Yangi afzallik"
      editTitle="Afzallikni tahrirlash"
      confirmText={(i) => `«${i.title.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <>
          <span className="block text-sm text-espresso">{i.title.ru}</span>
          <span className="mt-1 line-clamp-2 block text-[12px] text-espresso-soft">{i.text.ru}</span>
          <span className="mt-1 block text-[11px] text-espresso-soft/85">{i.icon}</span>
        </>
      )}
      renderFields={(d, set) => (
        <>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-espresso">Ikon</label>
            <select
              value={d.icon}
              onChange={(e) => set({ ...d, icon: e.target.value as Advantage["icon"] })}
              className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
            >
              {ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </div>
          <LocaleField label="Sarlavha" value={d.title} onChange={(title) => set({ ...d, title })} />
          <LocaleField label="Matn" multiline value={d.text} onChange={(text) => set({ ...d, text })} />
        </>
      )}
    />
  );
}
