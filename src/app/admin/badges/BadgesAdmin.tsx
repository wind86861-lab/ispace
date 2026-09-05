"use client";

import type { Badge } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { ImageUpload } from "../ImageUpload";
import { LocaleField, emptyLocaleString } from "../LocaleFields";

/**
 * Belgilar («4D», «ZERO», «SL» kabi nishonlar).
 *
 * `Feature` dan farqi shundaki, ikoni KODDA emas — admin yuklaydi.
 * Ya'ni yangi texnologiya chiqsa dasturchi kerak emas: belgi yaratiladi,
 * ikoni yuklanadi va kerakli mahsulotlarda yoqiladi.
 *
 * Ikon yuklanmaguncha belgi kartada KO'RSATILMAYDI (`ProductBadges`) —
 * shu sabab yarim tayyor belgi saytga chiqib ketmaydi.
 */
export function BadgesAdmin({ items }: { items: Badge[] }) {
  return (
    <CollectionAdmin<Badge>
      collection="badges"
      items={items}
      blank={() => ({
        _id: "",
        rank: (items.at(-1)?.rank ?? 0) + 1,
        label: emptyLocaleString(),
        sublabel: emptyLocaleString(),
        image: { src: "", alt: emptyLocaleString() },
      })}
      addLabel="Belgi qo‘shish"
      newTitle="Yangi belgi"
      editTitle="Belgini tahrirlash"
      confirmText={(i) => `«${i.label.ru || i.sublabel?.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <span className="flex items-center gap-3">
          {i.image.src ? (
            /* Ichki vosita — `next/image` optimizatsiyasi kerak emas. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={i.image.src} alt="" className="size-10 shrink-0 object-contain" />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cream text-[10px] text-taupe-text">
              —
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-sm text-espresso">
              {i.label.ru || "—"}
              {i.sublabel?.ru ? ` · ${i.sublabel.ru}` : ""}
            </span>
            <span className="mt-1 block text-[11px] text-espresso-soft/85">
              {i.image.src ? "rasm yuklangan" : "rasm yo‘q — kartada ko‘rinmaydi"}
            </span>
          </span>
        </span>
      )}
      renderFields={(d, set) => (
        <>
          <ImageUpload
            label="Ikon"
            prefix="badge"
            media={d.image}
            onChange={(image) => set({ ...d, image })}
            recommend={{ width: 224, height: 224 }}
            hint="Kvadrat. Rasm BUTUN nishon bo‘ladi — o‘z foni va o‘z yozuvi bilan (masalan metall plitka «DUAL TRACK»). Kartada u 56×56 da chiziladi, ustiga hech narsa qo‘shilmaydi. Shaffof fonli PNG ham bo‘ladi. Yuklanmaguncha belgi kartada ko‘rinmaydi."
          />

          {/*
            Yozuvlar endi kartada CHIZILMAYDI — ular rasmning o'zida
            bo'ladi. Bu yerda ular ikki ish uchun qoladi: ro'yxatda
            nishonni tanib olish va rasm uchun `alt` matni (ekran
            o'quvchi va SEO).
          */}
          <LocaleField
            label="Nomi (ro‘yxat va alt matni uchun, masalan «4D»)"
            value={d.label}
            onChange={(label) => set({ ...d, label })}
          />
          <LocaleField
            label="Qo‘shimcha nomi (masalan «массаж»)"
            value={d.sublabel ?? emptyLocaleString()}
            onChange={(sublabel) => set({ ...d, sublabel })}
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
              Kartada belgilar shu tartibda ustun bo‘lib turadi, ko‘pi bilan to‘rttasi.
              Bo‘sh qolgan joyni mahsulotning xususiyat ikonlari to‘ldiradi.
            </p>
          </div>
        </>
      )}
    />
  );
}
