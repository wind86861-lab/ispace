"use client";

import type { TimelinePoint } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { ImageUpload } from "../ImageUpload";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";

/**
 * Kompaniya tarixi — `/about` sahifasidagi gorizontal chiziq.
 *
 * Har nuqta = bitta yil. Sahifa aylantirilganda ular birin-ketin
 * ochiladi va o'ngdagi rasm ham shu nuqtanikiga almashadi.
 *
 * Tartib YIL bo'yicha, qo'lda emas: tarix xronologik va admin uni
 * qayta terishi kerak emas — yangi nuqta o'z joyiga tushadi.
 */
export function TimelineAdmin({ items }: { items: TimelinePoint[] }) {
  return (
    <CollectionAdmin<TimelinePoint>
      collection="timeline"
      items={[...items].sort((a, b) => a.year - b.year)}
      blank={() => ({
        _id: "",
        year: new Date().getFullYear(),
        title: emptyLocaleString(),
        text: emptyLocaleString(),
        image: { src: "", alt: emptyLocaleString() },
        stats: [],
      })}
      addLabel="Yil qo‘shish"
      newTitle="Yangi yil"
      editTitle="Yilni tahrirlash"
      confirmText={(i) => `${i.year} — «${i.title.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <span className="flex items-center gap-3">
          {i.image.src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={i.image.src} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-cream text-[11px] text-taupe-text">
              —
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-sm text-espresso">
              <span className="font-display text-gold-deep">{i.year}</span> · {i.title.ru}
            </span>
            <span className="mt-1 line-clamp-2 block text-[12px] text-espresso-soft">
              {i.text.ru}
            </span>
          </span>
        </span>
      )}
      renderFields={(d, set) => (
        <>
          <Field
            label="Yil"
            type="number"
            value={d.year}
            onChange={(v) => set({ ...d, year: Number(v) })}
            hint="Chiziqda shu son ko‘rinadi. Tartib yil bo‘yicha o‘zi hisoblanadi."
          />

          <LocaleField
            label="Sarlavha (masalan «Birinchi shourum»)"
            value={d.title}
            onChange={(title) => set({ ...d, title })}
          />
          <LocaleField
            label="Matn"
            multiline
            value={d.text}
            onChange={(text) => set({ ...d, text })}
          />

          {/*
            Raqamlar har yil uchun O'ZINIKI: tarixning ma'nosi ham
            shunda — o'quvchi kompaniya qanday o'sganini ko'radi.
            Bo'sh qoldirilsa, shu yilda raqamlar qatori chizilmaydi.
          */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Shu yilgi raqamlar
            </legend>

            <div className="grid gap-3">
              {d.stats.map((st, i) => (
                <div key={st._id || i} className="grid gap-3 rounded-xl border border-taupe/25 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                    <Field
                      label="Qiymat"
                      type="number"
                      value={st.value}
                      onChange={(v) =>
                        set({
                          ...d,
                          stats: d.stats.map((x, j) => (j === i ? { ...x, value: Number(v) } : x)),
                        })
                      }
                    />
                    <Field
                      label="Qo‘shimcha"
                      value={st.suffix ?? ""}
                      onChange={(v) =>
                        set({
                          ...d,
                          stats: d.stats.map((x, j) =>
                            j === i ? { ...x, suffix: v || undefined } : x,
                          ),
                        })
                      }
                      hint="Masalan «+»"
                    />
                  </div>

                  <LocaleField
                    label="Izoh"
                    value={st.label}
                    onChange={(label) =>
                      set({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, label } : x)) })
                    }
                  />

                  <button
                    type="button"
                    onClick={() => set({ ...d, stats: d.stats.filter((_, j) => j !== i) })}
                    className="justify-self-start text-[12px] text-rosewood hover:underline"
                  >
                    O‘chirish
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  set({
                    ...d,
                    stats: [
                      ...d.stats,
                      { _id: `st-${Date.now().toString(36)}`, value: 0, label: emptyLocaleString() },
                    ],
                  })
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Raqam qo‘shish
              </button>
            </div>
          </fieldset>

          <ImageUpload
            label="Rasm (ixtiyoriy)"
            prefix="timeline"
            media={d.image}
            onChange={(image) => set({ ...d, image })}
            recommend={{ width: 1200, height: 900 }}
            hint="Yuklanmasa nuqta faqat matn bilan chiziladi va matn kengayadi — bo‘sh ramka ko‘rinmaydi."
          />
        </>
      )}
    />
  );
}
