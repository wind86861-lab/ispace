"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category } from "@/content/types";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { ImageUpload } from "../ImageUpload";

const HEADERS = { "x-requested-with": "ispace-admin", "content-type": "application/json" };

/**
 * Kategoriya rasmining tavsiya etilgan o'lchami.
 *
 * Karta nisbati kontentga qarab uch xil bo'ladi, shuning uchun bitta
 * "universal" o'lcham yo'q: asosiy karta VERTIKAL (u ikki qatorni
 * egallaydi), keng banner esa juda yassi. Noto'g'ri nisbatdagi foto
 * kesilib, buyum yarim ko'rinib qoladi — shu sabab o'lcham muharrirda
 * oldindan aytiladi va yuklangandan keyin solishtiriladi.
 */
/** Katalog filtriga mos belgilar — qolgan ikonlar bu yerda ma'nosiz. */
const CATEGORY_ICONS = [
  "armchair", "sofa", "treadmill", "bike", "elliptical", "vending", "grid",
] as const;

function recommendedSize(featured?: boolean, wide?: boolean) {
  if (wide) return { width: 1600, height: 600 };
  if (featured) return { width: 1200, height: 1400 };
  return { width: 900, height: 700 };
}

const blank = (): Category => ({
  _id: "",
  slug: "",
  title: emptyLocaleString(),
  image: { src: "", alt: emptyLocaleString(), width: 900, height: 700 },
});

/** Ro'yxat serverdan keladi — izoh `ProductsAdmin` da. */
export function CategoriesAdmin({
  items,
  previews,
}: {
  items: Category[];
  /** `_id` → ko'rsatish uchun haqiqiy rasm URL'i (override qo'llangan). */
  previews: Record<string, string>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startRefresh] = useTransition();

  const load = async () => startRefresh(() => router.refresh());

  async function save(item: Category) {
    setBusy(true);
    setError(null);
    const isNew = !item._id;
    const res = await fetch(
      `/api/admin/content/categories${isNew ? "" : `?id=${encodeURIComponent(item._id)}`}`,
      { method: isNew ? "POST" : "PUT", headers: HEADERS, body: JSON.stringify(item) },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Saqlab bo‘lmadi");
    setEditing(null);
    await load();
  }

  async function remove(item: Category) {
    if (!confirm(`«${item.title.ru}» o‘chirilsinmi? Bu kategoriyadagi mahsulotlar katalogda ko‘rinmay qoladi.`))
      return;
    setBusy(true);
    await fetch(`/api/admin/content/categories?id=${encodeURIComponent(item._id)}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    setBusy(false);
    await load();
  }

  return (
    <>
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setEditing(blank())}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-deep px-4 py-2.5 text-[13px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover"
        >
          <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          Kategoriya qo‘shish
        </button>
      </div>

      <ul className="grid gap-3">
        {items.map((c) => (
          <li
            key={c._id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-taupe/30 bg-warm-white p-3"
          >
            <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
              <Image src={previews[c._id] ?? c.image.src} alt="" fill sizes="56px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-espresso">{c.title.ru}</span>
              <span className="mt-0.5 block text-[11px] text-espresso-soft/85">
                {c.slug}
                {c.featured ? " · asosiy" : ""}
                {c.wide ? " · keng" : ""}
              </span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(c)}
                aria-label="Tahrirlash"
                className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink"
              >
                <Pencil size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(c)}
                aria-label="O‘chirish"
                className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft transition-colors duration-300 hover:border-rosewood/60 hover:text-rosewood"
              >
                <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {editing && (
        <Editor
          value={editing}
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

function Editor({
  value,
  busy,
  error,
  onCancel,
  onSave,
}: {
  value: Category;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (c: Category) => void;
}) {
  const [c, setC] = useState<Category>(value);
  const set = <K extends keyof Category>(k: K, v: Category[K]) => setC((s) => ({ ...s, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(c);
        }}
        className="mx-auto max-w-2xl rounded-2xl border border-taupe/30 bg-warm-white p-6 sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-espresso">
            {c._id ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Yopish"
            className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft hover:border-gold/60"
          >
            <X size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5">
          <LocaleField label="Nomi" value={c.title} onChange={(v) => set("title", v)} />

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-espresso">
              Katalog filtridagi ikon
            </label>
            <select
              value={c.icon ?? ""}
              onChange={(e) => set("icon", (e.target.value || undefined) as Category["icon"])}
              className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
            >
              <option value="">— tanlanmagan —</option>
              {CATEGORY_ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-espresso-soft/85">
              Kategoriya RASMI emas, alohida belgi: u 18px da chiziladi va foto u yerda tanib
              bo‘lmas dog‘ga aylanardi. Tanlanmasa umumiy belgi ishlatiladi.
            </p>
          </div>
          <Field
            label="Slug (manzil)"
            value={c.slug}
            onChange={(v) => set("slug", v)}
            hint="Mahsulot shu slug orqali kategoriyaga bog‘lanadi"
          />
          <LocaleField
            label="Qisqa matn"
            required={false}
            value={c.text ?? emptyLocaleString()}
            onChange={(v) => set("text", v)}
          />
          <ImageUpload
            label="Kategoriya rasmi"
            media={c.image}
            prefix="category"
            onChange={(image) => set("image", image)}
            recommend={recommendedSize(c.featured, c.wide)}
            hint={
              c.wide
                ? "Keng banner: matn chapda turadi, buyum o‘ng tomonda bo‘lsin"
                : "Pastki qismida to‘q gradient bor — muhim qismi yuqorida bo‘lsin"
            }
          />

          <div className="flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2 text-[13px] text-espresso">
              <input
                type="checkbox"
                checked={!!c.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="size-4 accent-[var(--color-gold-deep)]"
              />
              Asosiy (katta karta)
            </label>
            <label className="inline-flex items-center gap-2 text-[13px] text-espresso">
              <input
                type="checkbox"
                checked={!!c.wide}
                onChange={(e) => set("wide", e.target.checked)}
                className="size-4 accent-[var(--color-gold-deep)]"
              />
              Keng (butun qator)
            </label>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-rosewood/10 px-4 py-3 text-[13px] text-rosewood">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-deep px-5 py-2.5 text-[13px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover disabled:opacity-50"
          >
            {busy && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            Saqlash
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-taupe/40 px-5 py-2.5 text-[13px] text-espresso-soft hover:border-gold/50"
          >
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
