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
