"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import type { SiteContact } from "@/content/types";
import { Field } from "../LocaleFields";

const HEADERS = { "x-requested-with": "ispace-admin", "content-type": "application/json" };

/**
 * Sayt kontaktlari — YAGONA yozuv.
 *
 * Shu sabab bu yerda `CollectionAdmin` ishlatilmaydi: u ro'yxat uchun
 * («qo'shish», «o'chirish»), bu yerda esa qo'shadigan ham,
 * o'chiradigan ham narsa yo'q — faqat tahrirlash.
 *
 * Telefon RAQAMI yetarli: `tel:` havolasini server raqamdan o'zi
 * yasaydi. Ilgari ikkita maydon bo'lgan va ular bir-biriga mos
 * kelmay qolishi mumkin edi.
 */
export function ContactsAdmin({ value }: { value: SiteContact }) {
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContact>(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SiteContact>(k: K, v: SiteContact[K]) => {
    setDraft((s) => ({ ...s, [k]: v }));
    setSaved(false);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch(
      `/api/admin/content/contact?id=${encodeURIComponent(draft._id || "contact")}`,
      { method: "PUT", headers: HEADERS, body: JSON.stringify(draft) },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) return setError(data.error ?? "Saqlab bo‘lmadi");
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-2xl">
      <div className="grid gap-5">
        <Field
          label="Telefon"
          value={draft.phone}
          onChange={(v) => set("phone", v)}
          hint="Bosiladigan havola raqamdan avtomatik yasaladi"
        />
        <Field label="E-mail" value={draft.email} onChange={(v) => set("email", v)} />

        <fieldset className="rounded-xl border border-gold/40 bg-gold/[0.05] p-4">
          <legend className="px-1 text-[13px] font-medium text-espresso">
            Telegram orqali bog‘lanish
          </legend>
          <p className="mb-4 text-[12px] text-espresso-soft/85">
            Mahsulot sahifasidagi tugma shu havolaga olib boradi va u{" "}
            <strong>hamma mahsulotda bitta</strong>. Bo‘sh qoldirilsa quyidagi
            Telegram havolasi ishlatiladi.
          </p>
          <Field
            label="Menejer havolasi"
            value={draft.telegramChat ?? ""}
            onChange={(v) => set("telegramChat", v || undefined)}
            hint="Masalan https://t.me/ispace_manager"
          />
        </fieldset>

        <Field label="Telegram" value={draft.telegram} onChange={(v) => set("telegram", v)} />
        <Field label="Instagram" value={draft.instagram} onChange={(v) => set("instagram", v)} />
        <Field label="Facebook" value={draft.facebook} onChange={(v) => set("facebook", v)} />
        <Field label="YouTube" value={draft.youtube} onChange={(v) => set("youtube", v)} />
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-rosewood/10 px-4 py-3 text-[13px] text-rosewood">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-5 rounded-xl bg-gold/12 px-4 py-3 text-[13px] text-gold-ink">Saqlandi.</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold-deep px-5 py-2.5 text-[13px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover disabled:opacity-50"
      >
        {busy && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
        Saqlash
      </button>
    </form>
  );
}
