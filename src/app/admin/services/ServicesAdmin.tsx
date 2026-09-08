"use client";

import type { ClientService, IconName } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { ImageUpload } from "../ImageUpload";

const ICONS: IconName[] = [
  "armchair", "credit-card", "shield", "truck",
  "wrench", "headset", "award", "sparkles", "hand", "map-pin", "layers",
];

export function ServicesAdmin({ items }: { items: ClientService[] }) {
  return (
    <CollectionAdmin<ClientService>
      collection="services"
      items={items}
      blank={() => ({
        _id: "",
        slug: "",
        icon: "sparkles",
        eyebrow: emptyLocaleString(),
        title: emptyLocaleString(),
        lead: emptyLocaleString(),
        points: [],
        media: { src: "", alt: emptyLocaleString() },
      })}
      addLabel="Bo‘lim qo‘shish"
      newTitle="Yangi bo‘lim"
      editTitle="Bo‘limni tahrirlash"
      confirmText={(i) => `«${i.title.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <>
          <span className="block text-sm text-espresso">{i.title.ru}</span>
          <span className="mt-1 line-clamp-2 block text-[12px] text-espresso-soft">{i.lead.ru}</span>
          <span className="mt-1 block text-[11px] text-espresso-soft/85">
            #{i.slug} · {i.icon} · {i.points.length} ta band
            {i.stat ? ` · ${i.stat.value}` : ""}
            {i.media.src ? " · media bor" : " · mediasiz"}
          </span>
        </>
      )}
      renderFields={(d, set) => {
        const patchStat = (next: Partial<NonNullable<ClientService["stat"]>>) =>
          set({
            ...d,
            stat: {
              value: d.stat?.value ?? "",
              unit: d.stat?.unit,
              label: d.stat?.label ?? emptyLocaleString(),
              ...next,
            },
          });

        return (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Langar (slug)"
                value={d.slug}
                onChange={(slug) => set({ ...d, slug })}
                hint="Sarlavha ostidagi chip shu bo‘yicha o‘tadi: masalan test-drive"
              />
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-espresso">Ikon</label>
                <select
                  value={d.icon}
                  onChange={(e) => set({ ...d, icon: e.target.value as IconName })}
                  className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
                >
                  {ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LocaleField
              label="Yuqoridagi yozuv"
              value={d.eyebrow}
              onChange={(eyebrow) => set({ ...d, eyebrow })}
            />
            <LocaleField label="Sarlavha" value={d.title} onChange={(title) => set({ ...d, title })} />
            <LocaleField
              label="Kirish matni"
              multiline
              value={d.lead}
              onChange={(lead) => set({ ...d, lead })}
            />

            {/* --- bandlar --- */}
            <fieldset className="rounded-xl border border-taupe/30 p-4">
              <legend className="px-1 text-[13px] font-medium text-espresso">
                Bandlar <span className="text-espresso-soft">({d.points.length})</span>
              </legend>
              <p className="mb-4 text-[12px] text-espresso-soft/85">
                Har band sahifada ikon bilan chizilib chiqadi. Bo‘sh band saqlashda tashlanadi.
              </p>
              <div className="grid gap-4">
                {d.points.map((pt, i) => (
                  <div key={i} className="grid gap-2">
                    <LocaleField
                      label={`Band ${i + 1}`}
                      value={pt}
                      onChange={(v) =>
                        set({ ...d, points: d.points.map((x, j) => (j === i ? v : x)) })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => set({ ...d, points: d.points.filter((_, j) => j !== i) })}
                      className="justify-self-start text-[12px] text-rosewood hover:underline"
                    >
                      O‘chirish
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set({ ...d, points: [...d.points, emptyLocaleString()] })}
                  className="justify-self-start text-[12px] text-gold-ink hover:underline"
                >
                  + Band
                </button>
              </div>
            </fieldset>

            {/* --- raqam --- */}
            <fieldset className="rounded-xl border border-taupe/30 p-4">
              <legend className="px-1 text-[13px] font-medium text-espresso">
                Sahifa boshidagi raqam (ixtiyoriy)
              </legend>
              <p className="mb-4 text-[12px] text-espresso-soft/85">
                Sarlavha ostidagi raqamlar chizig‘ida ko‘rinadi. Raqam tarjima qilinmaydi —
                so‘zlar birlik va izoh maydonlarida.
              </p>
              <div className="grid gap-4">
                <Field
                  label="Raqam"
                  value={d.stat?.value ?? ""}
                  onChange={(value) =>
                    value.trim()
                      ? patchStat({ value })
                      : set({ ...d, stat: undefined })
                  }
                  hint="Masalan: 500 000, 30%, 1–3"
                />
                {d.stat && (
                  <>
                    <LocaleField
                      label="Birlik"
                      value={d.stat.unit ?? emptyLocaleString()}
                      onChange={(unit) => patchStat({ unit })}
                    />
                    <LocaleField
                      label="Izoh"
                      value={d.stat.label}
                      onChange={(label) => patchStat({ label })}
                    />
                  </>
                )}
              </div>
            </fieldset>

            <ImageUpload
              label="Bo‘lim mediasi"
              media={d.media}
              prefix="service"
              allowVideo
              youtube
              recommend={{ width: 1200, height: 1500 }}
              hint="Rasm yoki video. Yuklanmasa bo‘lim faqat matn bilan chiqadi — bo‘sh ramka ko‘rinmaydi."
              onChange={(media) => set({ ...d, media })}
            />
            <LocaleField
              label="Media — alt matn"
              value={d.media.alt}
              onChange={(alt) => set({ ...d, media: { ...d.media, alt } })}
            />

            <LocaleField
              label="Yakuniy jumla (ixtiyoriy)"
              multiline
              required={false}
              value={d.outro ?? emptyLocaleString()}
              onChange={(outro) => set({ ...d, outro })}
            />
          </>
        );
      }}
    />
  );
}
