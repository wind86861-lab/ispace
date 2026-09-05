"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";

const HEADERS = { "x-requested-with": "ispace-admin", "content-type": "application/json" };

type Entity = { _id: string };

/**
 * Kolleksiya uchun umumiy ro'yxat + modal muharrir.
 *
 * Filiallar, savol-javob va afzalliklar bir xil naqshda ishlaydi:
 * ro'yxat → tahrirlash → saqlash → o'chirish. Ularning har biriga
 * alohida 200 qatorlik komponent yozish o'sha mantiqni uch marta
 * takrorlash bo'lardi; farq faqat FORMA maydonlarida, shuning uchun
 * forma `renderFields` orqali tashqaridan beriladi.
 */
export function CollectionAdmin<T extends Entity>({
  collection,
  items,
  blank,
  addLabel,
  editTitle,
  newTitle,
  renderRow,
  renderFields,
  confirmText,
}: {
  collection: string;
  items: T[];
  blank: () => T;
  addLabel: string;
  editTitle: string;
  newTitle: string;
  renderRow: (item: T) => ReactNode;
  renderFields: (draft: T, set: (next: T) => void) => ReactNode;
  confirmText: (item: T) => string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startRefresh] = useTransition();

  const reload = () => startRefresh(() => router.refresh());

  async function save(item: T) {
    setBusy(true);
    setError(null);
    const isNew = !item._id;
    const res = await fetch(
      `/api/admin/content/${collection}${isNew ? "" : `?id=${encodeURIComponent(item._id)}`}`,
      { method: isNew ? "POST" : "PUT", headers: HEADERS, body: JSON.stringify(item) },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Saqlab bo‘lmadi");
    setEditing(null);
    reload();
  }

  async function remove(item: T) {
    if (!confirm(confirmText(item))) return;
    setBusy(true);
    await fetch(`/api/admin/content/${collection}?id=${encodeURIComponent(item._id)}`, {
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
          {addLabel}
        </button>
      </div>

      <ul className="grid gap-3">
        {items.map((item) => (
          <li
            key={item._id}
            className="flex flex-wrap items-start gap-4 rounded-2xl border border-taupe/30 bg-warm-white p-4"
          >
            <span className="min-w-0 flex-1">{renderRow(item)}</span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(item)}
                aria-label="Tahrirlash"
                className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft transition-colors duration-300 hover:border-gold/60 hover:text-gold-ink"
              >
                <Pencil size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(item)}
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
        <Modal
          title={editing._id ? editTitle : newTitle}
          busy={busy}
          error={error}
          draft={editing}
          renderFields={renderFields}
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

function Modal<T extends Entity>({
  title,
  draft,
  busy,
  error,
  renderFields,
  onCancel,
  onSave,
}: {
  title: string;
  draft: T;
  busy: boolean;
  error: string | null;
  renderFields: (draft: T, set: (next: T) => void) => ReactNode;
  onCancel: () => void;
  onSave: (item: T) => void;
}) {
  const [item, setItem] = useState<T>(draft);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(item);
        }}
        className="mx-auto max-w-2xl rounded-2xl border border-taupe/30 bg-warm-white p-6 sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-espresso">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Yopish"
            className="grid size-9 place-items-center rounded-xl border border-taupe/40 text-espresso-soft hover:border-gold/60"
          >
            <X size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5">{renderFields(item, setItem)}</div>

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
