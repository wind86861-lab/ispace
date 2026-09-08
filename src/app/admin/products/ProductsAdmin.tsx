"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import type {
  Badge,
  Category,
  LocaleString,
  Media,
  Product,
  ProductFeature,
  ProductOption,
  ProductStoryBlock,
  SpecRow,
} from "@/content/types";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { MAX_BADGES } from "@/lib/limits";
import { ImageUpload } from "../ImageUpload";
import { FEATURE_ICONS } from "@/components/ui/icons";

const HEADERS = {
  "x-requested-with": "ispace-admin",
  "content-type": "application/json",
};

/** Yangi mahsulotning bo'sh qolipi. */
function blank(categorySlug: string): Product {
  return {
    _id: "",
    slug: "",
    title: emptyLocaleString(),
    category: categorySlug,
    price: 0,
    currency: "UZS",
    rank: 100,
    isNew: false,
    inStock: true,
    features: [],
    images: [{ src: "", alt: emptyLocaleString(), width: 900, height: 900 }],
  };
}

/**
 * Ro'yxat serverdan prop bilan keladi, mijozda qayta so'ralmaydi.
 *
 * Shunday qilingani: sahifa ochilishida "yuklanmoqda" holati umuman
 * bo'lmaydi va ma'lumot bitta manbadan — server komponentdan — keladi.
 * O'zgartirishdan keyin `router.refresh()` serverdagi ro'yxatni qayta
 * oldiradi, ya'ni holat ikki joyda saqlanmaydi.
 */
export function ProductsAdmin({
  items,
  categories,
  badges,
  features,
  previews,
}: {
  items: Product[];
  categories: Category[];
  /** Xususiyatlar katalogi — «Xususiyatlar» bo'limida yaratiladi. */
  features: ProductFeature[];
  /** «Belgilar» bo'limida yaratilgan nishonlar — shu yerda yoqiladi. */
  badges: Badge[];
  /** `_id` → ko'rsatish uchun haqiqiy rasm URL'i (override qo'llangan). */
  previews: Record<string, string>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startRefresh] = useTransition();

  const load = async () => startRefresh(() => router.refresh());

  async function save(item: Product) {
    setBusy(true);
    setError(null);
    // `_id` bo'sh — yangi yozuv; aks holda mavjudini yangilaymiz.
    const isNew = !item._id;
    const res = await fetch(
      `/api/admin/content/products${isNew ? "" : `?id=${encodeURIComponent(item._id)}`}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: HEADERS,
        body: JSON.stringify(item),
      },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Saqlab bo‘lmadi");
      return;
    }
    setEditing(null);
    await load();
  }

  async function remove(item: Product) {
    if (!confirm(`«${item.title.ru}» o‘chirilsinmi?`)) return;
    setBusy(true);
    await fetch(
      `/api/admin/content/products?id=${encodeURIComponent(item._id)}`,
      {
        method: "DELETE",
        headers: HEADERS,
      },
    );
    setBusy(false);
    await load();
  }

  return (
    <>
      <div className="mb-5">
        <button
          type="button"
          onClick={() =>
            setEditing(blank(categories[0]?.slug ?? "massage-chairs"))
          }
          className="inline-flex items-center gap-2 rounded-xl bg-gold-deep px-4 py-2.5 text-[13px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover"
        >
          <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          Mahsulot qo‘shish
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-espresso-soft">Hozircha mahsulot yo‘q.</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((p) => (
            <li
              key={p._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-taupe/30 bg-warm-white p-3"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                <Image
                  src={previews[p._id] ?? p.images[0].src}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-espresso">
                  {p.title.ru}
                </span>
                <span className="mt-0.5 block text-[11px] text-espresso-soft/85">
                  {p.slug} · {p.category} · {p.price.toLocaleString("ru-RU")}{" "}
                  so‘m
                  {p.isNew ? " · yangi" : ""}
                </span>
                {/*
                  Solishtirish jadvali `specs` va `features` dan qator
                  yasaydi. Ular bo'sh bo'lsa mahsulot jadvalda deyarli
                  bo'sh ustun bo'lib turadi — buni MAHSULOT ro'yxatida
                  aytish kerak, aks holda muammo faqat saytda ko'rinadi
                  va sababi noma'lum qoladi.
                */}
                {(p.specs?.length ?? 0) === 0 && p.features.length === 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold/12 px-2 py-0.5 text-[11px] text-gold-ink">
                    Solishtirish uchun xarakteristika yoki xususiyat yo‘q
                  </span>
                )}
              </span>

              <span className="flex gap-2">
                <IconButton label="Tahrirlash" onClick={() => setEditing(p)}>
                  <Pencil size={15} strokeWidth={1.6} aria-hidden="true" />
                </IconButton>
                <IconButton
                  label="O‘chirish"
                  onClick={() => void remove(p)}
                  danger
                >
                  <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
                </IconButton>
              </span>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductEditor
          value={editing}
          all={items}
          categories={categories}
          badges={badges}
          features={features}
          busy={busy}
          error={error}
          onCancel={() => {
            setEditing(null);
            setError(null);
          }}
          onSave={save}
        />
      )}
    </>
  );
}

function IconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "grid size-9 place-items-center rounded-xl border transition-colors duration-300",
        danger
          ? "border-taupe/40 text-espresso-soft hover:border-rosewood/60 hover:text-rosewood"
          : "border-taupe/40 text-espresso-soft hover:border-gold/60 hover:text-gold-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function ProductEditor({
  value,
  all,
  categories,
  badges,
  features,
  busy,
  error,
  onCancel,
  onSave,
}: {
  value: Product;
  /**
   * Barcha mahsulotlar — xarakteristika QOLIPINI hisoblash uchun.
   *
   * Solishtirish jadvalining qatorlari yorliqlar bo'yicha
   * birlashtiriladi. Ikki muharrir bir xil narsani «Мощность» va
   * «Мощность, Вт» deb yozsa, jadvalda ikkita yarim bo'sh qator
   * paydo bo'ladi. Shuning uchun forma o'sha kategoriyadagi mavjud
   * yorliqlarni taklif qiladi.
   */
  all: Product[];
  categories: Category[];
  badges: Badge[];
  features: ProductFeature[];
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (p: Product) => void;
}) {
  const [p, setP] = useState<Product>(value);
  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setP((s) => ({ ...s, [k]: v }));

  /*
   * Shu kategoriyadagi BOSHQA mahsulotlarda uchragan yorliqlar —
   * birinchi uchragan tartibda va takrorsiz.
   */
  const specTemplate = useMemo(() => {
    const seen = new Map<string, LocaleString>();
    for (const item of all) {
      if (item.category !== p.category || item._id === p._id) continue;
      for (const row of item.specs ?? []) {
        const key = row.label.ru.trim().toLowerCase();
        if (key && !seen.has(key)) seen.set(key, row.label);
      }
    }
    return [...seen.values()];
  }, [all, p.category, p._id]);

  const setImage = (i: number, next: Partial<Media>) =>
    set(
      "images",
      p.images.map((m, j) => (j === i ? { ...m, ...next } : m)),
    );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(p);
        }}
        className="mx-auto max-w-3xl rounded-2xl border border-taupe/30 bg-warm-white p-6 sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-espresso">
            {p._id ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
          </h2>
          <IconButton label="Yopish" onClick={onCancel}>
            <X size={16} strokeWidth={1.6} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="grid gap-5">
          <LocaleField
            label="Nomi"
            value={p.title}
            onChange={(v) => set("title", v)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Slug (manzil)"
              value={p.slug}
              onChange={(v) => set("slug", v)}
              hint="Faqat lotin harfi, raqam va defis — masalan crown-2"
            />

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-espresso">
                Kategoriya
              </label>
              <select
                value={p.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.title.ru}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Narx (so‘m)"
              type="number"
              value={p.price}
              onChange={(v) => set("price", Number(v))}
            />
            <Field
              label="Eski narx (ixtiyoriy)"
              type="number"
              value={p.oldPrice ?? ""}
              onChange={(v) =>
                set("oldPrice", v === "" ? undefined : Number(v))
              }
            />
            <Field
              label="Tartib raqami"
              type="number"
              value={p.rank}
              onChange={(v) => set("rank", Number(v))}
              hint="Kichik raqam oldinroq turadi"
            />
            <Field
              label="Reyting (0–5, ixtiyoriy)"
              type="number"
              step="0.1"
              value={p.rating ?? ""}
              onChange={(v) => set("rating", v === "" ? undefined : Number(v))}
            />
            {/*
              Brend SOLISHTIRISH jadvalining alohida qatori.

              Ilgari bu maydon formada umuman yo'q edi: urug'dagi
              mahsulotlarda u bor, admin qo'shganida esa hech qachon
              to'ldirilmasdi va jadvaldagi «Бренд» qatori bo'sh
              chiqardi.
            */}
            <Field
              label="Brend (ixtiyoriy)"
              value={p.brand ?? ""}
              onChange={(v) => set("brand", v || undefined)}
              hint="Solishtirish jadvalida alohida qator bo‘lib chiqadi"
            />
            <Field
              label="Sharhlar soni (ixtiyoriy)"
              type="number"
              value={p.reviewCount ?? ""}
              onChange={(v) =>
                set("reviewCount", v === "" ? undefined : Number(v))
              }
              hint="Reyting yonida ko‘rsatiladi"
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <Checkbox
              label="Yangi mahsulot"
              checked={!!p.isNew}
              onChange={(v) => set("isNew", v)}
            />
            <Checkbox
              label="Mavjud"
              checked={p.inStock ?? true}
              onChange={(v) => set("inStock", v)}
            />
            <Checkbox
              label="Bosh sahifada («Популярные модели»)"
              checked={!!p.featured}
              onChange={(v) => set("featured", v)}
            />
          </div>

          <LocaleField
            label="Tavsif"
            multiline
            required={false}
            value={p.description ?? emptyLocaleString()}
            onChange={(v) => set("description", v)}
          />

          {/* --- rasmlar --- */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Rasmlar
            </legend>
            <div className="grid gap-4">
              {p.images.map((m, i) => (
                <div key={i} className="grid gap-3">
                  <ImageUpload
                    label={`Media ${i + 1}`}
                    media={m}
                    prefix="product"
                    allowVideo
                    youtube
                    onChange={(next) => setImage(i, next)}
                    recommend={{ width: 900, height: 900 }}
                    hint={
                      i === 0
                        ? "Birinchi rasm — kartada va katalogda ko‘rinadi"
                        : undefined
                    }
                  />
                  {p.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "images",
                          p.images.filter((_, j) => j !== i),
                        )
                      }
                      className="justify-self-start text-[12px] text-rosewood hover:underline"
                    >
                      Rasmni olib tashlash
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  set("images", [
                    ...p.images,
                    {
                      src: "",
                      alt: emptyLocaleString(),
                      width: 900,
                      height: 900,
                    },
                  ])
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Yana media
              </button>
            </div>
          </fieldset>

          {/* --- pastki bo'limlar (hikoya) --- */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Mahsulot haqida bo‘limlar
            </legend>
            <p className="mb-3 text-[11px] text-espresso-soft/85">
              Sahifaning pastki qismi: sarlavha, matn va media. Media RASM ham, VIDEO ham
              bo‘lishi mumkin. Media yuklanmagan blok sahifada umuman chizilmaydi.
            </p>

            <div className="grid gap-4">
              {(p.story ?? []).map((block, i) => (
                <div key={block._id} className="grid gap-3 rounded-xl border border-taupe/25 p-3.5">
                  <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-espresso">
                        Ko‘rinishi
                      </label>
                      <select
                        value={block.layout}
                        onChange={(e) =>
                          set(
                            "story",
                            (p.story ?? []).map((x, j) =>
                              j === i
                                ? { ...x, layout: e.target.value as ProductStoryBlock["layout"] }
                                : x,
                            ),
                          )
                        }
                        className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
                      >
                        <option value="wide">Keng banner</option>
                        <option value="split">Matn va media yonma-yon</option>
                        <option value="pair">Ikkita media yonma-yon</option>
                      </select>
                      <p className="mt-1.5 text-[11px] text-espresso-soft/85">
                        {block.layout === "wide"
                          ? "Sarlavha va matn banner USTIDA, markazda."
                          : block.layout === "split"
                            ? "Matn bir tomonda, media ikkinchisida."
                            : "Ikkita media yonma-yon; sarlavha va matn ularning ustida."}
                      </p>
                    </div>

                    <LocaleField
                      label="Sarlavha (ixtiyoriy)"
                      value={block.title ?? emptyLocaleString()}
                      onChange={(title) =>
                        set(
                          "story",
                          (p.story ?? []).map((x, j) => (j === i ? { ...x, title } : x)),
                        )
                      }
                    />
                  </div>

                  <LocaleField
                    label="Matn (ixtiyoriy)"
                    multiline
                    value={block.text ?? emptyLocaleString()}
                    onChange={(text) =>
                      set(
                        "story",
                        (p.story ?? []).map((x, j) => (j === i ? { ...x, text } : x)),
                      )
                    }
                  />

                  {/*
                    YouTube havolasi — media o'rniga. Berilgan bo'lsa u
                    yuklangan rasmdan ustun turadi va blok video bo'lib
                    chiziladi. Havola saqlashda ID ga aylantiriladi,
                    noto'g'risi esa jimgina tashlab yuboriladi.
                  */}
                  <Field
                    label="YouTube havolasi (ixtiyoriy)"
                    value={block.youtubeId ?? ""}
                    onChange={(v) =>
                      set(
                        "story",
                        (p.story ?? []).map((x, j) => (j === i ? { ...x, youtubeId: v } : x)),
                      )
                    }
                    hint="youtube.com/watch?v=… , youtu.be/… yoki shorts havolasi. Berilsa quyidagi media o‘rniga video ko‘rsatiladi."
                  />

                  {/*
                    Quyidagi maydonlar MAKETGA QARAB o'zgaradi: har
                    ko'rinish boshqa narsani talab qiladi va keraksiz
                    maydon adminni chalg'itadi.
                  */}
                  {block.layout === "split" && (
                    <>
                      <label className="flex items-center gap-2 text-[13px] text-espresso">
                        <input
                          type="checkbox"
                          checked={Boolean(block.reverse)}
                          onChange={(e) =>
                            set(
                              "story",
                              (p.story ?? []).map((x, j) =>
                                j === i ? { ...x, reverse: e.target.checked } : x,
                              ),
                            )
                          }
                          className="size-4 accent-[var(--color-gold-deep)]"
                        />
                        Media CHAP tomonda tursin (matn o‘ngda)
                      </label>

                      <fieldset className="rounded-xl border border-taupe/25 p-3">
                        <legend className="px-1 text-[12px] font-medium text-espresso">
                          Matn yonidagi kichik rasmlar
                        </legend>
                        <p className="mb-3 text-[11px] text-espresso-soft/85">
                          Ixtiyoriy: matn ostida kichik kvadrat rasmlar qatori bo‘lib chiziladi.
                          Faqat yuklanganlari ko‘rinadi.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-3">
                          {(block.thumbs ?? []).map((m, k) => (
                            <ImageUpload
                              key={k}
                              label={`Kichik ${k + 1}`}
                              prefix="story-thumb"
                              media={m}
                              recommend={{ width: 400, height: 300 }}
                              onChange={(next) =>
                                set(
                                  "story",
                                  (p.story ?? []).map((x, j) =>
                                    j === i
                                      ? {
                                          ...x,
                                          thumbs: (x.thumbs ?? []).map((y, q) =>
                                            q === k ? next : y,
                                          ),
                                        }
                                      : x,
                                  ),
                                )
                              }
                            />
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              set(
                                "story",
                                (p.story ?? []).map((x, j) =>
                                  j === i
                                    ? {
                                        ...x,
                                        thumbs: [
                                          ...(x.thumbs ?? []),
                                          { src: "", alt: emptyLocaleString() },
                                        ],
                                      }
                                    : x,
                                ),
                              )
                            }
                            className="text-[12px] text-gold-ink hover:underline"
                          >
                            + Kichik rasm
                          </button>

                          {(block.thumbs?.length ?? 0) > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                set(
                                  "story",
                                  (p.story ?? []).map((x, j) =>
                                    j === i ? { ...x, thumbs: (x.thumbs ?? []).slice(0, -1) } : x,
                                  ),
                                )
                              }
                              className="text-[12px] text-rosewood hover:underline"
                            >
                              Oxirgisini o‘chirish
                            </button>
                          )}
                        </div>
                      </fieldset>
                    </>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {block.media.map((m, k) => (
                      <ImageUpload
                        key={k}
                        label={`Media ${k + 1}`}
                        prefix="story"
                        allowVideo
                        media={m}
                        onChange={(next) =>
                          set(
                            "story",
                            (p.story ?? []).map((x, j) =>
                              j === i
                                ? { ...x, media: x.media.map((y, q) => (q === k ? next : y)) }
                                : x,
                            ),
                          )
                        }
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {/*
                      Ikkinchi media faqat `pair` da chiziladi: `wide` va
                      `split` birinchisini oladi, qolgani e'tiborsiz
                      qoladi. Shuning uchun tugma ham faqat o'sha yerda.
                    */}
                    {block.layout === "pair" && (
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "story",
                          (p.story ?? []).map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  media: [...x.media, { src: "", alt: emptyLocaleString() }],
                                }
                              : x,
                          ),
                        )
                      }
                      className="text-[12px] text-gold-ink hover:underline"
                    >
                      + Media
                    </button>
                    )}

                    <button
                      type="button"
                      onClick={() => set("story", (p.story ?? []).filter((_, j) => j !== i))}
                      className="text-[12px] text-rosewood hover:underline"
                    >
                      Blokni o‘chirish
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  set("story", [
                    ...(p.story ?? []),
                    {
                      _id: `st-${Date.now().toString(36)}`,
                      layout: "wide",
                      title: emptyLocaleString(),
                      text: emptyLocaleString(),
                      media: [{ src: "", alt: emptyLocaleString() }],
                    },
                  ])
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Bo‘lim qo‘shish
              </button>
            </div>
          </fieldset>

          {/* --- savdo maydonchalari --- */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Savdo maydonchalari
            </legend>
            <p className="mb-3 text-[11px] text-espresso-soft/85">
              Uzum, Alif, Yandex Market va boshqalar. Logotip yuklanmasa ham havola ishlaydi —
              u yerda nom matn bo‘lib chiqadi.
            </p>

            <div className="grid gap-4">
              {(p.marketplaces ?? []).map((mp, i) => (
                <div key={mp._id || i} className="grid gap-3 rounded-xl border border-taupe/25 p-3.5">
                  <ImageUpload
                    label="Logotip"
                    prefix="marketplace"
                    media={mp.image}
                    onChange={(image) =>
                      set(
                        "marketplaces",
                        (p.marketplaces ?? []).map((x, j) => (j === i ? { ...x, image } : x)),
                      )
                    }
                    recommend={{ width: 240, height: 80 }}
                    hint="Shaffof fonli PNG yoki SVG."
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Nomi"
                      value={mp.name}
                      onChange={(name) =>
                        set(
                          "marketplaces",
                          (p.marketplaces ?? []).map((x, j) => (j === i ? { ...x, name } : x)),
                        )
                      }
                    />
                    <Field
                      label="Havola (https://)"
                      value={mp.url}
                      onChange={(url) =>
                        set(
                          "marketplaces",
                          (p.marketplaces ?? []).map((x, j) => (j === i ? { ...x, url } : x)),
                        )
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "marketplaces",
                        (p.marketplaces ?? []).filter((_, j) => j !== i),
                      )
                    }
                    className="justify-self-start text-[12px] text-rosewood hover:underline"
                  >
                    O‘chirish
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  set("marketplaces", [
                    ...(p.marketplaces ?? []),
                    {
                      _id: `mp-${Date.now().toString(36)}`,
                      name: "",
                      url: "",
                      image: { src: "", alt: emptyLocaleString() },
                    },
                  ])
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Maydoncha qo‘shish
              </button>
            </div>
          </fieldset>

          {/* --- belgilar --- */}
          <BadgePicker
            all={badges}
            selected={p.badgeIds ?? []}
            onChange={(badgeIds) => set("badgeIds", badgeIds)}
          />

          {/*
            Xususiyatlar QO'LDA yozilmaydi — katalogdan belgilanadi.

            Ilgari har mahsulotda yorliq qaytadan yozilardi va kichik
            farq ham («Прогрев» / «Прогрев спины») solishtirish
            jadvalida ikkita alohida qator berardi: matritsa umuman
            qurilmasdi. Katalogda ta'rif bitta — qatorlar o'z-o'zidan
            ustma-ust tushadi.
          */}
          <FeaturePicker
            all={features}
            /*
              Eski yozuvlarda `featureIds` yo'q — tanlov ichki
              `features` dan topiladi va saqlashda `featureIds` bo'lib
              yoziladi, ya'ni migratsiya birinchi tahrirda o'zidan
              bo'ladi.

              Moslik YORLIQ bo'yicha, ikon bo'yicha EMAS.

              Sabab real ma'lumotdan chiqdi: bir mahsulotda ikon
              `heat`, yorlig'i esa «Невесомость» edi — admin ikonni
              noto'g'ri tanlagan. Ikon bo'yicha moslashtirilsa,
              migratsiya o'sha xususiyatni jimgina «Прогрев спины» ga
              aylantirib yuborardi. Yorliq — foydalanuvchi ko'radigan
              va solishtirish jadvali guruhlaydigan haqiqiy o'ziga
              xoslik; ikon esa bezak.
            */
            selected={
              p.featureIds ??
              p.features
                .map(
                  (f) =>
                    features.find(
                      (c) => c.label.ru.trim().toLowerCase() === f.label.ru.trim().toLowerCase(),
                    )?._id ??
                    /* Yorliq katalogda yo'q — oxirgi chora sifatida ikon. */
                    features.find((c) => c.icon === f.icon)?._id,
                )
                .filter((id): id is string => Boolean(id))
            }
            onChange={(featureIds) => set("featureIds", featureIds)}
          />

          <SpecsEditor
            specs={p.specs ?? []}
            template={specTemplate}
            onChange={(specs) => set("specs", specs.length > 0 ? specs : undefined)}
          />

          <OptionsEditor
            title="Ranglar"
            itemLabel="Rang"
            field="swatch"
            options={p.colors ?? []}
            onChange={(colors) => set("colors", colors.length > 0 ? colors : undefined)}
          />

          <OptionsEditor
            title="Komplektatsiyalar"
            itemLabel="Komplektatsiya"
            field="extra"
            options={p.bundles ?? []}
            onChange={(bundles) => set("bundles", bundles.length > 0 ? bundles : undefined)}
          />

          {/*
            Yetkazib berish sharti — mahsulot sahifasidagi alohida
            ichki bo'lim (`ProductTabs`). U ham formada yo'q edi va
            faqat urug' faylidagi mahsulotlarda ko'rinardi.
          */}
          <LocaleField
            label="Yetkazib berish (ixtiyoriy)"
            multiline
            required={false}
            value={p.delivery ?? emptyLocaleString()}
            onChange={(v) => set("delivery", v)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-rosewood/10 px-4 py-3 text-[13px] text-rosewood"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-deep px-5 py-2.5 text-[13px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover disabled:opacity-50"
          >
            {busy && (
              <LoaderCircle
                size={15}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            Saqlash
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-taupe/40 px-5 py-2.5 text-[13px] text-espresso-soft transition-colors duration-300 hover:border-gold/50"
          >
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Xarakteristikalar — SOLISHTIRISH jadvalining asosiy manbasi.
 *
 * Jadval qatorlari qo'lda yozilmaydi, ular shu ro'yxatdagi yorliqlar
 * bo'yicha birlashtiriladi. Ya'ni bu yer bo'sh bo'lsa, solishtirishda
 * narx va reytingdan boshqa hech narsa qolmaydi — aynan shu sabab
 * admin qo'shgan mahsulotlar jadvalda "ishlamayotgandek" ko'rinardi.
 *
 * Yorliqlar KATEGORIYA bo'ylab bir xil bo'lishi shart: aks holda har
 * mahsulot o'z qatorini keltirib chiqaradi va jadval yarim bo'sh
 * kataklar to'riga aylanadi. Shu sabab qolip tugmasi bor.
 */
function SpecsEditor({
  specs,
  template,
  onChange,
}: {
  specs: SpecRow[];
  /** Shu kategoriyadagi boshqa mahsulotlarda uchragan yorliqlar. */
  template: LocaleString[];
  onChange: (next: SpecRow[]) => void;
}) {
  const used = new Set(specs.map((r) => r.label.ru.trim().toLowerCase()));
  const missing = template.filter((l) => !used.has(l.ru.trim().toLowerCase()));

  const patch = (i: number, next: Partial<SpecRow>) =>
    onChange(specs.map((r, j) => (j === i ? { ...r, ...next } : r)));

  return (
    <fieldset className="rounded-xl border border-taupe/30 p-4">
      <legend className="px-1 text-[13px] font-medium text-espresso">
        Xarakteristikalar{" "}
        <span className="text-espresso-soft">({specs.length})</span>
      </legend>

      <p className="mb-4 text-[12px] text-espresso-soft/85">
        Solishtirish jadvalidagi qatorlar shu ro‘yxatdan hosil bo‘ladi. Yorliqlar bir
        kategoriya ichida bir xil yozilsa, qatorlar ustma-ust tushadi.
      </p>

      {missing.length > 0 && (
        <div className="mb-4 rounded-xl border border-gold/40 bg-gold/[0.06] p-3">
          <p className="text-[12px] text-espresso">
            Shu kategoriyadagi boshqa mahsulotlarda bor, bu yerda yo‘q:{" "}
            <span className="text-espresso-soft">
              {missing.map((l) => l.ru).join(", ")}
            </span>
          </p>
          <button
            type="button"
            onClick={() =>
              onChange([
                ...specs,
                /* Yorliq to'ldirilgan, QIYMAT bo'sh — uni admin yozadi. */
                ...missing.map((label) => ({ label, value: emptyLocaleString() })),
              ])
            }
            className="mt-2 text-[12px] font-medium text-gold-ink hover:underline"
          >
            Yetishmayotgan qatorlarni qo‘shish
          </button>
        </div>
      )}

      <div className="grid gap-5">
        {specs.map((row, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-taupe/25 p-3">
            <LocaleField
              label={`Yorliq ${i + 1}`}
              value={row.label}
              onChange={(label) => patch(i, { label })}
            />
            <LocaleField
              label={`Qiymat ${i + 1}`}
              value={row.value}
              onChange={(value) => patch(i, { value })}
            />
            <button
              type="button"
              onClick={() => onChange(specs.filter((_, j) => j !== i))}
              className="justify-self-start text-[12px] text-rosewood hover:underline"
            >
              Qatorni o‘chirish
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            onChange([...specs, { label: emptyLocaleString(), value: emptyLocaleString() }])
          }
          className="justify-self-start text-[12px] text-gold-ink hover:underline"
        >
          + Xarakteristika
        </button>
      </div>
    </fieldset>
  );
}

/**
 * Rang va komplektatsiya muharriri.
 *
 * Ikkalasi ham `ProductOption`: uch tilli nom + qo'shimcha bitta
 * maydon. Rangda bu — namuna (`hex`), komplektatsiyada narx ustamasi
 * (`extra`). Ikki alohida komponent yozish shu farqni takrorlash
 * bo'lardi.
 *
 * `_id` saqlashda nomdan hosil qilinadi — admin uni o'ylab
 * topmasligi kerak, lekin u barqaror bo'lishi shart: savatdagi
 * tanlov shu bo'yicha saqlanadi.
 */
function OptionsEditor({
  title,
  itemLabel,
  options,
  field,
  onChange,
}: {
  title: string;
  /** Bitta bandning nomi — «Rang», «Komplektatsiya». */
  itemLabel: string;
  options: ProductOption[];
  /** `swatch` — rang namunasi; `extra` — narx ustamasi. */
  field: "swatch" | "extra";
  onChange: (next: ProductOption[]) => void;
}) {
  const patch = (i: number, next: Partial<ProductOption>) =>
    onChange(options.map((c, j) => (j === i ? { ...c, ...next } : c)));

  return (
    <fieldset className="rounded-xl border border-taupe/30 p-4">
      <legend className="px-1 text-[13px] font-medium text-espresso">
        {title} <span className="text-espresso-soft">({options.length})</span>
      </legend>

      <div className="grid gap-5">
        {options.map((c, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-taupe/25 p-3">
            <LocaleField
              label={`${itemLabel} ${i + 1}`}
              value={c.label}
              onChange={(label) => patch(i, { label })}
            />

            {field === "swatch" ? (
              <label className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-espresso">Namuna</span>
                {/*
                  Rang tanlagich HAR DOIM to'g'ri HEX beradi — qo'lda
                  yozilgan qiymat noto'g'ri bo'lsa namuna buzilardi.
                */}
                <input
                  type="color"
                  value={c.hex ?? "#d8c7ac"}
                  onChange={(e) => patch(i, { hex: e.target.value })}
                  className="size-9 cursor-pointer rounded-lg border border-taupe/45 bg-cream"
                />
                <code className="text-[12px] text-espresso-soft">{c.hex ?? "—"}</code>
                {c.hex && (
                  <button
                    type="button"
                    onClick={() => patch(i, { hex: undefined })}
                    className="text-[12px] text-espresso-soft hover:text-rosewood"
                  >
                    Namunasiz
                  </button>
                )}
              </label>
            ) : (
              <Field
                label="Narxga qo‘shimcha (so‘m, ixtiyoriy)"
                type="number"
                value={c.extra ?? ""}
                onChange={(v) => patch(i, { extra: v === "" ? undefined : Number(v) })}
                hint="Bo‘sh qoldirilsa asosiy narxdan farq qilmaydi"
              />
            )}

            <button
              type="button"
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="justify-self-start text-[12px] text-rosewood hover:underline"
            >
              O‘chirish
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            onChange([
              ...options,
              /* `_id` saqlashda nomdan hosil bo'ladi. */
              {
                _id: "",
                label: emptyLocaleString(),
                ...(field === "swatch" ? { hex: "#d8c7ac" } : {}),
              },
            ])
          }
          className="justify-self-start text-[12px] text-gold-ink hover:underline"
        >
          + {itemLabel}
        </button>
      </div>
    </fieldset>
  );
}

/**
 * Mahsulotga xususiyat biriktirish.
 *
 * Xususiyatlarning O'ZI «Xususiyatlar» bo'limida yaratiladi. Bu yerda
 * faqat TANLASH — shu sabab yorliq matni hech qachon ikki xil
 * yozilmaydi va solishtirish jadvalidagi qatorlar mos tushadi.
 *
 * Chegara — o'n ikkita: kartada ular ikon bo'lib bir qatorga tushadi
 * va undan ko'pi shunchaki sig'maydi. Chegara serverda ham bor,
 * chunki interfeys yagona himoya bo'la olmaydi.
 */
function FeaturePicker({
  all,
  selected,
  onChange,
}: {
  all: ProductFeature[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const found = [...all]
    .sort((a, b) => a.rank - b.rank)
    .filter((f) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return Object.values(f.label).some((v) => String(v).toLowerCase().includes(q));
    });

  const full = selected.length >= 12;

  return (
    <fieldset className="rounded-xl border border-taupe/30 p-4">
      <legend className="px-1 text-[13px] font-medium text-espresso">
        Xususiyatlar{" "}
        <span className={full ? "text-gold-ink" : "text-espresso-soft"}>
          ({selected.length}/12)
        </span>
      </legend>

      {all.length === 0 ? (
        <p className="text-[13px] text-espresso-soft">
          Katalog bo‘sh. Avval «Xususiyatlar» bo‘limida xususiyat yarating.
        </p>
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Xususiyat qidirish"
            className="mb-4 w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2 text-[13px] text-espresso outline-none focus:border-gold"
          />

          <ul className="grid gap-2 sm:grid-cols-2">
            {found.map((f) => {
              const Icon = FEATURE_ICONS[f.icon];
              const on = selected.includes(f._id);
              /* To'lgan ro'yxatda faqat YECHISH mumkin — qo'shish emas. */
              const locked = full && !on;

              return (
                <li key={f._id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      onChange(
                        on ? selected.filter((id) => id !== f._id) : [...selected, f._id],
                      )
                    }
                    className={[
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors duration-300",
                      on
                        ? "border-gold-deep bg-gold/10 text-gold-ink"
                        : "border-taupe/40 text-espresso-soft hover:border-gold/50",
                      locked ? "cursor-not-allowed opacity-40" : "",
                    ].join(" ")}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/[0.06] text-gold">
                      <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px]">{f.label.ru}</span>
                    {on && <Check size={15} strokeWidth={2.2} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </fieldset>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-espresso">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-gold-deep)]"
      />
      {label}
    </label>
  );
}

/**
 * Mahsulotga nishon biriktirish.
 *
 * Nishonlarning O'ZI «Belgilar» bo'limida yaratiladi — u yerda rasm
 * yuklanadi va nom beriladi. Bu yerda esa faqat TANLASH: ro'yxat
 * uzayganda kerakligini topish uchun qidiruv bor, va chegara —
 * ko'pi bilan to'rtta.
 *
 * Nega to'rtta: kartada nishonlar rasm ustida ustun bo'lib turadi va
 * beshinchisi pastdagi narx blokining ustiga chiqib ketadi. Chegara
 * serverda ham bor (`MAX_BADGES`), chunki interfeys yagona himoya
 * bo'la olmaydi.
 */
function BadgePicker({
  all,
  selected,
  onChange,
}: {
  all: Badge[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const name = (b: Badge) =>
    [b.label.ru, b.sublabel?.ru].filter(Boolean).join(" ").trim() || b._id;

  const found = all.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [b.label, b.sublabel]
      .flatMap((v) => (v ? Object.values(v) : []))
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const full = selected.length >= MAX_BADGES;

  return (
    <fieldset className="rounded-xl border border-taupe/30 p-4">
      <legend className="px-1 text-[13px] font-medium text-espresso">
        Belgilar{" "}
        <span className={full ? "text-gold-ink" : "text-espresso-soft"}>
          {selected.length}/{MAX_BADGES}
        </span>
      </legend>

      {all.length === 0 ? (
        <p className="text-[12px] text-espresso-soft">
          Hali belgi yaratilmagan — «Belgilar» bo‘limida rasm yuklab, nom
          bering.
        </p>
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Belgini qidirish…"
            className="mb-3 w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
          />

          <ul className="grid gap-2 sm:grid-cols-2">
            {found.map((b) => {
              const on = selected.includes(b._id);
              // To'lgan bo'lsa YANGISINI qo'shib bo'lmaydi, lekin
              // belgilanganini olib tashlash doim mumkin.
              const locked = full && !on;
              return (
                <li key={b._id}>
                  <label
                    className={[
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-300",
                      on ? "border-gold/60 bg-gold/10" : "border-taupe/35",
                      locked
                        ? "opacity-45"
                        : "cursor-pointer hover:border-gold/50",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={locked}
                      onChange={() =>
                        onChange(
                          on
                            ? selected.filter((id) => id !== b._id)
                            : [...selected, b._id],
                        )
                      }
                      className="size-4 shrink-0 accent-[var(--color-gold-deep)]"
                    />

                    {/* Ikon — matnli nomdan ko'ra tezroq tanitadi. */}
                    {b.image.src ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={b.image.src}
                        alt=""
                        className="size-8 shrink-0 object-contain"
                      />
                    ) : (
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cream text-[10px] text-taupe-text">
                        —
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-espresso">
                        {name(b)}
                      </span>
                      {!b.image.src && (
                        <span className="block text-[11px] text-rosewood">
                          rasm yo‘q — kartada ko‘rinmaydi
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {found.length === 0 && (
            <p className="text-[12px] text-espresso-soft">
              Bunday belgi topilmadi.
            </p>
          )}

          <p className="mt-3 text-[11px] text-espresso-soft/85">
            {full
              ? "Chegaraga yetdi. Boshqasini qo‘shish uchun avval bittasini olib tashlang."
              : `Yana ${MAX_BADGES - selected.length} ta tanlash mumkin.`}
          </p>
        </>
      )}
    </fieldset>
  );
}
