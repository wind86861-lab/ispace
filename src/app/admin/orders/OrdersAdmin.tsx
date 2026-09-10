"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Phone, Trash2 } from "lucide-react";
import type { Order } from "@/content/types";

const HEADERS = { "x-requested-with": "ispace-admin", "content-type": "application/json" };

const SOURCE_LABEL: Record<Order["source"], string> = {
  cart: "Savat buyurtmasi",
  consultation: "Konsultatsiya",
  lead: "Qidiruv formasi",
  "test-drive": "Test-drayv",
};

const STATUS: { key: Order["status"]; label: string; cls: string }[] = [
  { key: "new", label: "Yangi", cls: "border-gold-deep bg-gold/12 text-gold-ink" },
  { key: "called", label: "Qo‘ng‘iroq qilindi", cls: "border-taupe/50 bg-cream text-espresso" },
  { key: "done", label: "Yakunlandi", cls: "border-taupe/40 bg-transparent text-espresso-soft" },
];

/**
 * Buyurtmalar va murojaatlar.
 *
 * Ro'yxat serverdan prop bilan keladi va o'zgarishdan keyin
 * `router.refresh()` uni qayta oldiradi — holat ikki joyda
 * saqlanmaydi.
 *
 * Bu bo'lim boshqa kontent bo'limlariga o'xshamaydi: yozuvlar
 * SAYTDAN keladi, admin ularni yaratmaydi. Shuning uchun `+ qo'shish`
 * tugmasi yo'q, faqat holat va o'chirish.
 */
export function OrdersAdmin({ items }: { items: Order[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [, startRefresh] = useTransition();

  const reload = () => startRefresh(() => router.refresh());

  async function setStatus(id: string, status: Order["status"]) {
    setBusy(id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ id, status }),
    });
    setBusy(null);
    reload();
  }

  async function remove(order: Order) {
    if (!confirm(`${order.phone} — murojaat o‘chirilsinmi?`)) return;
    setBusy(order._id);
    await fetch(`/api/admin/orders?id=${encodeURIComponent(order._id)}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    setBusy(null);
    reload();
  }

  const shown = filter === "all" ? items : items.filter((o) => o.status === filter);
  const newCount = items.filter((o) => o.status === "new").length;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["all", "new", "called", "done"] as const).map((key) => {
          const on = key === filter;
          const count =
            key === "all" ? items.length : items.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={[
                "rounded-xl border px-3.5 py-2 text-[13px] transition-colors duration-300",
                on
                  ? "border-gold-deep bg-gold/12 text-gold-ink"
                  : "border-taupe/40 text-espresso-soft hover:border-gold/50",
              ].join(" ")}
            >
              {key === "all" ? "Hammasi" : STATUS.find((s) => s.key === key)!.label}
              <span className="ms-1.5 text-espresso-soft/70">{count}</span>
            </button>
          );
        })}

        {newCount > 0 && (
          <span className="ms-auto text-[13px] text-gold-ink">{newCount} ta yangi murojaat</span>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-espresso-soft">
          {items.length === 0
            ? "Hozircha murojaat yo‘q. Saytdan buyurtma kelganda shu yerda paydo bo‘ladi."
            : "Bu holatda murojaat yo‘q."}
        </p>
      ) : (
        <ul className="grid gap-3">
          {shown.map((o) => (
            <li
              key={o._id}
              className="rounded-2xl border border-taupe/30 bg-warm-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-espresso">
                      {o.name || "Ism ko‘rsatilmagan"}
                    </span>
                    <span className="rounded-full border border-taupe/40 px-2 py-0.5 text-[11px] text-espresso-soft">
                      {SOURCE_LABEL[o.source]}
                    </span>
                  </p>

                  {/*
                    Raqam BOSILADI: menejer uni qo'lda ko'chirmasligi
                    kerak — telefonda bosish darrov qo'ng'iroq qiladi.
                  */}
                  <a
                    href={`tel:${o.phone.replace(/\D/g, "")}`}
                    className="mt-1.5 inline-flex items-center gap-2 text-[15px] text-gold-ink hover:underline"
                  >
                    <Phone size={14} strokeWidth={1.7} aria-hidden="true" />
                    {o.phone}
                  </a>

                  <p className="mt-1 text-[12px] text-espresso-soft/85">
                    {new Date(o.createdAt).toLocaleString("ru-RU")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {busy === o._id && (
                    <LoaderCircle size={15} className="animate-spin text-espresso-soft" />
                  )}
                  {STATUS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => void setStatus(o._id, s.key)}
                      className={[
                        "rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors duration-300",
                        o.status === s.key ? s.cls : "border-taupe/30 text-espresso-soft/70 hover:border-gold/50",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => void remove(o)}
                    aria-label="O‘chirish"
                    className="grid size-8 place-items-center rounded-lg border border-taupe/40 text-espresso-soft transition-colors duration-300 hover:border-rosewood/60 hover:text-rosewood"
                  >
                    <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {o.comment && (
                <p className="mt-3 rounded-xl bg-cream/70 px-4 py-3 text-[13px] leading-relaxed text-espresso-soft">
                  {o.comment}
                </p>
              )}

              {o.items && o.items.length > 0 && (
                <div className="mt-4 border-t border-taupe/25 pt-3">
                  <ul className="grid gap-1.5">
                    {o.items.map((it, i) => (
                      <li key={i} className="flex justify-between gap-4 text-[13px]">
                        <span className="min-w-0 text-espresso">
                          {it.title}
                          <span className="text-espresso-soft/85"> × {it.qty}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-espresso-soft">
                          {(it.price * it.qty).toLocaleString("ru-RU")} so‘m
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2.5 flex justify-between gap-4 border-t border-taupe/25 pt-2.5 text-sm">
                    <span className="text-espresso-soft">Jami</span>
                    <span className="font-medium tabular-nums text-espresso">
                      {o.total.toLocaleString("ru-RU")} so‘m
                    </span>
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
