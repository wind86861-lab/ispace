"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import type {
  Badge,
  Category,
  Feature,
  Media,
  Product,
  ProductStoryBlock,
} from "@/content/types";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { MAX_BADGES } from "@/lib/limits";
import { ImageUpload } from "../ImageUpload";

const HEADERS = {
  "x-requested-with": "ispace-admin",
  "content-type": "application/json",
};

const FEATURE_ICONS: Feature["icon"][] = [
  "zero-gravity",
  "body-scan",
  "bluetooth",
  "heat",
  "sl-track",
  "air",
  "folding",
  "quiet",
];

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
  previews,
}: {
  items: Product[];
  categories: Category[];
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
          categories={categories}
          badges={badges}
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
  categories,
  badges,
  busy,
  error,
  onCancel,
  onSave,
}: {
  value: Product;
  categories: Category[];
  badges: Badge[];
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (p: Product) => void;
}) {
  const [p, setP] = useState<Product>(value);
  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setP((s) => ({ ...s, [k]: v }));

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
                    {/* `pair` ikkita media talab qiladi — qo'shish shu uchun. */}
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

          {/* --- xususiyatlar --- */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Xususiyatlar
            </legend>
            <div className="grid gap-4">
              {p.features.map((f, i) => (
                <div
                  key={i}
                  className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end"
                >
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-espresso">
                      Ikon
                    </label>
                    <select
                      value={f.icon}
                      onChange={(e) =>
                        set(
                          "features",
                          p.features.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  icon: e.target.value as Feature["icon"],
                                }
                              : x,
                          ),
                        )
                      }
                      className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
                    >
                      {FEATURE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <LocaleField
                    label="Yorliq"
                    value={f.label}
                    onChange={(v) =>
                      set(
                        "features",
                        p.features.map((x, j) =>
                          j === i ? { ...x, label: v } : x,
                        ),
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "features",
                        p.features.filter((_, j) => j !== i),
                      )
                    }
                    className="pb-2.5 text-[12px] text-rosewood hover:underline"
                  >
                    O‘chirish
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  set("features", [
                    ...p.features,
                    { icon: "zero-gravity", label: emptyLocaleString() },
                  ])
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Xususiyat
              </button>
            </div>
          </fieldset>
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
