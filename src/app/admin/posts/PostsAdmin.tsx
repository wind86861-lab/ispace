"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import type { LocaleString, Post, PostBlock } from "@/content/types";
import { Field, LocaleField, emptyLocaleString } from "../LocaleFields";
import { ImageUpload } from "../ImageUpload";

const HEADERS = { "x-requested-with": "ispace-admin", "content-type": "application/json" };

const CATEGORIES: Post["category"][] = ["massage", "reviews", "health", "tips", "news"];
const CATEGORY_LABEL: Record<Post["category"], string> = {
  massage: "Massaj va salomatlik",
  reviews: "Sharhlar",
  health: "Salomatlik",
  tips: "Maslahatlar",
  news: "Yangiliklar",
};

const BLOCK_LABEL: Record<PostBlock["kind"], string> = {
  paragraph: "Xatboshi",
  heading: "Sarlavha",
  list: "Ro‘yxat",
  quote: "Iqtibos",
  image: "Rasm",
};

const blank = (): Post => ({
  _id: "",
  slug: "",
  category: "massage",
  title: emptyLocaleString(),
  excerpt: emptyLocaleString(),
  cover: { src: "", alt: emptyLocaleString(), width: 800, height: 500 },
  publishedAt: new Date().toISOString().slice(0, 10),
  readingMinutes: 5,
  body: [],
});

/** Yangi blok — turiga qarab bo'sh qolip. */
function newBlock(kind: PostBlock["kind"]): PostBlock {
  if (kind === "list") return { kind, items: [emptyLocaleString()] };
  if (kind === "image")
    return { kind, media: { src: "", alt: emptyLocaleString(), width: 1600, height: 900 } };
  if (kind === "quote") return { kind, text: emptyLocaleString() };
  return { kind, text: emptyLocaleString() };
}

export function PostsAdmin({
  items,
  previews,
}: {
  items: Post[];
  /** `_id` → ko'rsatish uchun haqiqiy muqova URL'i. */
  previews: Record<string, string>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startRefresh] = useTransition();

  const reload = () => startRefresh(() => router.refresh());

  async function save(item: Post) {
    setBusy(true);
    setError(null);
    const isNew = !item._id;
    const res = await fetch(
      `/api/admin/content/posts${isNew ? "" : `?id=${encodeURIComponent(item._id)}`}`,
      { method: isNew ? "POST" : "PUT", headers: HEADERS, body: JSON.stringify(item) },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Saqlab bo‘lmadi");
    setEditing(null);
    reload();
  }

  async function remove(item: Post) {
    if (!confirm(`«${item.title.ru}» o‘chirilsinmi?`)) return;
    setBusy(true);
    await fetch(`/api/admin/content/posts?id=${encodeURIComponent(item._id)}`, {
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
          <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          Maqola qo‘shish
        </button>
      </div>

      <ul className="grid gap-3">
        {items.map((p) => (
          <li
            key={p._id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-taupe/30 bg-warm-white p-3"
          >
            <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
              <Image
                src={previews[p._id] ?? p.cover.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-espresso">{p.title.ru}</span>
              <span className="mt-0.5 block text-[11px] text-espresso-soft/85">
                {p.slug} · {CATEGORY_LABEL[p.category]} · {p.publishedAt} ·{" "}
                {p.body?.length ?? 0} ta blok
              </span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(p)}
                aria-label="Tahrirlash"
                className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink"
              >
                <Pencil size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(p)}
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
  value: Post;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (p: Post) => void;
}) {
  const [p, setP] = useState<Post>(value);
  const set = <K extends keyof Post>(k: K, v: Post[K]) => setP((s) => ({ ...s, [k]: v }));

  const body = p.body ?? [];
  const setBlock = (i: number, next: PostBlock) =>
    set("body", body.map((b, j) => (j === i ? next : b)));
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= body.length) return;
    const next = [...body];
    [next[i], next[j]] = [next[j], next[i]];
    set("body", next);
  };

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
            {p._id ? "Maqolani tahrirlash" : "Yangi maqola"}
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
          <LocaleField label="Sarlavha" value={p.title} onChange={(v) => set("title", v)} />
          <LocaleField
            label="Qisqacha mazmun"
            multiline
            value={p.excerpt}
            onChange={(v) => set("excerpt", v)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (manzil)" value={p.slug} onChange={(v) => set("slug", v)} />
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-espresso">Rukn</label>
              <select
                value={p.category}
                onChange={(e) => set("category", e.target.value as Post["category"])}
                className="w-full rounded-xl border border-taupe/45 bg-cream px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-gold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Chop etilgan sana"
              type="date"
              value={p.publishedAt}
              onChange={(v) => set("publishedAt", v)}
            />
            <Field
              label="O‘qish vaqti (daqiqa)"
              type="number"
              value={p.readingMinutes}
              onChange={(v) => set("readingMinutes", Number(v))}
            />
          </div>

          <ImageUpload
            label="Muqova rasmi"
            media={p.cover}
            prefix="post"
            onChange={(cover) => set("cover", cover)}
            recommend={{ width: 800, height: 500 }}
          />

          <label className="inline-flex items-center gap-2 text-[13px] text-espresso">
            <input
              type="checkbox"
              checked={!!p.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="size-4 accent-[var(--color-gold-deep)]"
            />
            Bosh sahifadagi blokda ko‘rinsin
          </label>

          {/* --- maqola matni --- */}
          <fieldset className="rounded-xl border border-taupe/30 p-4">
            <legend className="px-1 text-[13px] font-medium text-espresso">Maqola matni</legend>

            <div className="grid gap-5">
              {body.map((b, i) => (
                <div key={i} className="rounded-xl border border-taupe/25 bg-cream/50 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] tracking-[0.1em] text-espresso-soft/85 uppercase">
                      {i + 1}. {BLOCK_LABEL[b.kind]}
                    </span>
                    <span className="flex gap-2 text-[12px]">
                      <button type="button" onClick={() => move(i, -1)} className="text-espresso-soft hover:text-gold-ink">
                        ↑
                      </button>
                      <button type="button" onClick={() => move(i, 1)} className="text-espresso-soft hover:text-gold-ink">
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => set("body", body.filter((_, j) => j !== i))}
                        className="text-rosewood hover:underline"
                      >
                        O‘chirish
                      </button>
                    </span>
                  </div>

                  <BlockFields block={b} onChange={(next) => setBlock(i, next)} />
                </div>
              ))}

              <div className="flex flex-wrap gap-2">
                {(Object.keys(BLOCK_LABEL) as PostBlock["kind"][]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => set("body", [...body, newBlock(kind)])}
                    className="rounded-full border border-taupe/40 px-3 py-1.5 text-[12px] text-espresso-soft transition-colors duration-300 hover:border-gold/50 hover:text-gold-ink"
                  >
                    + {BLOCK_LABEL[kind]}
                  </button>
                ))}
              </div>
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

/** Blok turiga mos maydonlar. */
function BlockFields({
  block,
  onChange,
}: {
  block: PostBlock;
  onChange: (b: PostBlock) => void;
}) {
  if (block.kind === "paragraph" || block.kind === "heading") {
    return (
      <LocaleField
        label="Matn"
        multiline={block.kind === "paragraph"}
        value={block.text}
        onChange={(text) => onChange({ ...block, text })}
      />
    );
  }

  if (block.kind === "quote") {
    return (
      <div className="grid gap-4">
        <LocaleField
          label="Iqtibos"
          multiline
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
        />
        <LocaleField
          label="Muallif (ixtiyoriy)"
          required={false}
          value={block.author ?? emptyLocaleString()}
          onChange={(author) => onChange({ ...block, author })}
        />
      </div>
    );
  }

  if (block.kind === "list") {
    const setItem = (i: number, v: LocaleString) =>
      onChange({ ...block, items: block.items.map((x, j) => (j === i ? v : x)) });

    return (
      <div className="grid gap-4">
        {block.items.map((item, i) => (
          <div key={i} className="grid gap-1">
            <LocaleField label={`Qator ${i + 1}`} value={item} onChange={(v) => setItem(i, v)} />
            {block.items.length > 1 && (
              <button
                type="button"
                onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                className="justify-self-start text-[12px] text-rosewood hover:underline"
              >
                Qatorni olib tashlash
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...block, items: [...block.items, emptyLocaleString()] })}
          className="justify-self-start text-[12px] text-gold-ink hover:underline"
        >
          + Qator
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <ImageUpload
        label="Rasm"
        media={block.media}
        prefix="post-body"
        recommend={{ width: 1600, height: 900 }}
        onChange={(media) => onChange({ ...block, media })}
        hint="Rasm yuklanmaguncha bu blok maqolada ko‘rsatilmaydi"
      />
    </div>
  );
}
