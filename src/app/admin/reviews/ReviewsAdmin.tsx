"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Star, Trash2, X } from "lucide-react";
import type { Media, Review } from "@/content/types";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { ImageUpload } from "../ImageUpload";

const HEADERS = { "x-requested-with": "ispace-admin", "content-type": "application/json" };

const blank = (): Review => ({
  _id: "",
  author: emptyLocaleString(),
  text: emptyLocaleString(),
  rating: 5,
  publishedAt: new Date().toISOString().slice(0, 10),
});

export function ReviewsAdmin({ items }: { items: Review[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startRefresh] = useTransition();

  const reload = () => startRefresh(() => router.refresh());

  async function save(item: Review) {
    setBusy(true);
    setError(null);
    const isNew = !item._id;
    const res = await fetch(
      `/api/admin/content/reviews${isNew ? "" : `?id=${encodeURIComponent(item._id)}`}`,
      { method: isNew ? "POST" : "PUT", headers: HEADERS, body: JSON.stringify(item) },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Saqlab bo‘lmadi");
    setEditing(null);
    reload();
  }

  async function remove(item: Review) {
    if (!confirm(`«${item.author.ru}» sharhi o‘chirilsinmi?`)) return;
    setBusy(true);
    await fetch(`/api/admin/content/reviews?id=${encodeURIComponent(item._id)}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    setBusy(false);
    reload();
  }

  return (
    <>
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setEditing(blank())}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-deep px-4 py-2.5 text-[13px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover"
        >
          Sharh qo‘shish
        </button>
      </div>

      <ul className="grid gap-3">
        {items.map((r) => (
          <li
            key={r._id}
            className="flex flex-wrap items-start gap-4 rounded-2xl border border-taupe/30 bg-warm-white p-4"
          >
            <span className="flex shrink-0 gap-0.5" aria-label={`${r.rating} / 5`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={13}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className={i < r.rating ? "text-gold" : "text-taupe-text/40"}
                  fill={i < r.rating ? "currentColor" : "none"}
                />
              ))}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm text-espresso">{r.author.ru}</span>
              <span className="mt-1 line-clamp-2 block text-[12px] text-espresso-soft">
                {r.text.ru}
              </span>
              <span className="mt-1 block text-[11px] text-espresso-soft/85">
                {r.publishedAt}
                {r.photos?.length ? ` · ${r.photos.length} ta foto` : ""}
                {r.youtubeId ? " · video" : ""}
              </span>
            </span>

            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(r)}
                aria-label="Tahrirlash"
                className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink"
              >
                <Pencil size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(r)}
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
  value: Review;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (r: Review) => void;
}) {
  const [r, setR] = useState<Review>(value);
  const set = <K extends keyof Review>(k: K, v: Review[K]) => setR((s) => ({ ...s, [k]: v }));

  const photos = r.photos ?? [];
  const setPhoto = (i: number, m: Media) =>
    set("photos", photos.map((x, j) => (j === i ? m : x)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Rasm yuklanmagan bo'sh kartochkalar saqlashga ketmasin.
          onSave({ ...r, photos: photos.filter((m) => m.src) });
        }}
        className="mx-auto max-w-2xl rounded-2xl border border-taupe/30 bg-warm-white p-6 sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-espresso">
            {r._id ? "Sharhni tahrirlash" : "Yangi sharh"}
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
          <LocaleField label="Muallif" value={r.author} onChange={(v) => set("author", v)} />
          <LocaleField label="Sharh matni" multiline value={r.text} onChange={(v) => set("text", v)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-espresso">Baho</label>
              <select
                value={r.rating}
                onChange={(e) => set("rating", Number(e.target.value) as Review["rating"])}
                className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Sana"
              type="date"
              value={r.publishedAt}
              onChange={(v) => set("publishedAt", v)}
            />
          </div>

          <Field
            label="YouTube video ID (ixtiyoriy)"
            value={r.youtubeId ?? ""}
            onChange={(v) => set("youtubeId", v || undefined)}
            hint="Havoladagi 11 belgili qism — masalan youtu.be/XXXXXXXXXXX"
          />

          {/* --- fotolar --- */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">
              Mijoz fotolari (ixtiyoriy)
            </legend>
            <div className="grid gap-5">
              {photos.map((m, i) => (
                <div key={i} className="grid gap-3">
                  <ImageUpload
                    label={`Foto ${i + 1}`}
                    media={m}
                    prefix="review"
                    onChange={(next) => setPhoto(i, next)}
                  />
                  <LocaleField
                    label={`Foto ${i + 1} — alt matn`}
                    value={m.alt}
                    onChange={(alt) => setPhoto(i, { ...m, alt })}
                  />
                  <button
                    type="button"
                    onClick={() => set("photos", photos.filter((_, j) => j !== i))}
                    className="justify-self-start text-[12px] text-rosewood hover:underline"
                  >
                    Fotoni olib tashlash
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  set("photos", [...photos, { src: "", alt: emptyLocaleString() }])
                }
                className="justify-self-start text-[12px] text-gold-ink hover:underline"
              >
                + Foto
              </button>
            </div>
          </fieldset>
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
