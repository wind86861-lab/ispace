"use client";

import type { Branch } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { ImageUpload } from "../ImageUpload";

export function BranchesAdmin({ items }: { items: Branch[] }) {
  return (
    <CollectionAdmin<Branch>
      collection="branches"
      items={items}
      blank={() => ({
        _id: "",
        // Xaritadagi nuqta kaliti — yangi filial uchun mavjudlaridan biri
        // tanlanadi, aks holda nuqta chizilmaydi.
        mapId: items[0]?.mapId ?? "tashkent-yunusabad",
        city: emptyLocaleString(),
        district: emptyLocaleString(),
        address: emptyLocaleString(),
        phone: "",
        hours: emptyLocaleString(),
        mapsUrl: "https://maps.google.com/?q=41.3,69.2",
        geo: { lat: 41.3, lng: 69.2 },
      })}
      addLabel="Filial qo‘shish"
      newTitle="Yangi filial"
      editTitle="Filialni tahrirlash"
      confirmText={(i) => `«${i.city.ru} — ${i.district.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <>
          <span className="block text-sm text-espresso">
            {i.city.ru} — {i.district.ru}
          </span>
          <span className="mt-1 block text-[12px] text-espresso-soft">{i.address.ru}</span>
          <span className="mt-1 block text-[11px] text-espresso-soft/85">
            {i.phone} · {i.geo.lat.toFixed(4)}, {i.geo.lng.toFixed(4)}
          </span>
        </>
      )}
      renderFields={(d, set) => (
        <>
          <LocaleField label="Shahar" value={d.city} onChange={(city) => set({ ...d, city })} />
          <LocaleField label="Tuman / hudud" value={d.district} onChange={(district) => set({ ...d, district })} />
          <LocaleField label="Manzil" value={d.address} onChange={(address) => set({ ...d, address })} />
          <LocaleField label="Ish vaqti" value={d.hours} onChange={(hours) => set({ ...d, hours })} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefon" value={d.phone} onChange={(phone) => set({ ...d, phone })} />
            <Field
              label="Google Maps havolasi"
              value={d.mapsUrl}
              onChange={(mapsUrl) => set({ ...d, mapsUrl })}
            />
            <Field
              label="Kenglik (lat)"
              type="number"
              step="0.0001"
              value={d.geo.lat}
              onChange={(v) => set({ ...d, geo: { ...d.geo, lat: Number(v) } })}
              hint="Sahifadagi xarita shu koordinata bo‘yicha ochiladi"
            />
            <Field
              label="Uzunlik (lng)"
              type="number"
              step="0.0001"
              value={d.geo.lng}
              onChange={(v) => set({ ...d, geo: { ...d.geo, lng: Number(v) } })}
            />
          </div>

          {/*
            Filial fotolari — sahifada slayder bo'lib chiqadi.

            Eski bitta rasmli maydon (`photo`) saqlanadi va ro'yxatning
            BOSHIDA ko'rsatiladi: mavjud filiallarda rasm o'sha yerda
            yotibdi, uni yo'qotib bo'lmaydi. Yangi rasm shu ro'yxatga
            qo'shiladi.
          */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Filial fotolari{" "}
              <span className="text-espresso-soft">
                ({(d.photo?.src ? 1 : 0) + (d.photos?.length ?? 0)})
              </span>
            </legend>
            <p className="mb-4 text-[12px] text-espresso-soft/85">
              Bir nechta rasm yuklansa sahifada slayder bo‘ladi. Bittasi ham yuklanmasa
              ustun ko‘rsatilmaydi — ma’lumot va xarita butun kenglikni oladi.
            </p>

            <div className="grid gap-5">
              <ImageUpload
                label="Asosiy foto"
                prefix="branch"
                recommend={{ width: 1200, height: 800 }}
                media={d.photo ?? { src: "", alt: emptyLocaleString() }}
                onChange={(photo) => set({ ...d, photo })}
              />

              {(d.photos ?? []).map((m, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-taupe/25 p-3">
                  <ImageUpload
                    label={`Foto ${i + 2}`}
                    prefix="branch"
                    recommend={{ width: 1200, height: 800 }}
                    media={m}
                    onChange={(next) =>
                      set({ ...d, photos: (d.photos ?? []).map((x, j) => (j === i ? next : x)) })
                    }
                  />
                  <LocaleField
                    label={`Foto ${i + 2} — alt matn`}
                    value={m.alt}
                    onChange={(alt) =>
                      set({
                        ...d,
                        photos: (d.photos ?? []).map((x, j) => (j === i ? { ...x, alt } : x)),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set({ ...d, photos: (d.photos ?? []).filter((_, j) => j !== i) })
                    }
                    className="justify-self-start text-[12px] text-rosewood hover:underline"
                  >
                    Olib tashlash
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  set({
                    ...d,
                    photos: [...(d.photos ?? []), { src: "", alt: emptyLocaleString() }],
                  })
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Foto
              </button>
            </div>
          </fieldset>
        </>
      )}
    />
  );
}
