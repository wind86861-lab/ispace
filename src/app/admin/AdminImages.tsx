"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  Film,
  ImageUp,
  LoaderCircle,
  LogOut,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { slotGroups, type ImageSlot } from "@/lib/image-slot-types";

type SlotState = ImageSlot & {
  /** Hozir ko'rsatilayotgan rasm (yuklangan bo'lsa — yangi yo'l). */
  url: string;
  bytes?: number;
  missing?: boolean;
  replaced?: boolean;
  /** Fayldagi haqiqiy o'lcham — uyaning `width`/`height` si TALAB, bu esa BOR holat. */
  actualWidth?: number;
  actualHeight?: number;
};

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "ok" } | { kind: "error"; text: string };

const API = "/api/admin/images";
/** CSRF uchun qo'shimcha to'siq — server shu sarlavhani talab qiladi. */
const HEADERS = { "x-requested-with": "ispace-admin" };

const formatBytes = (n?: number) =>
  n === undefined ? "—" : n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;

/**
 * Rasm uyani to'ldirishga yetadimi?
 *
 * Tomonlar nisbati mos kelmasligi normal — rasm kesib joylashtiriladi
 * (`cover`). Shuning uchun har bir tomonni alohida solishtirish noto'g'ri
 * ogohlantirish beradi; kerakli mezon — uyani qoplash uchun rasmni
 * CHO'ZISH kerak bo'ladimi yoki yo'q.
 */
/**
 * Kartada nima ko'rsatiladi: rasmmi yoki video.
 *
 * `video` uyasida javob oldindan ma'lum. `media` uyasida esa admin
 * ikkalasidan birini yuklagan bo'lishi mumkin — shuning uchun javobni
 * FAYL KENGAYTMASI beradi.
 */
const isVideo = (slot: SlotState) => slot.kind === "video" || /\.(mp4|webm)$/i.test(slot.url);

/** Uya video ham qabul qiladimi — fayl tanlash oynasi shunga qarab ochiladi. */
const acceptsVideo = (slot: SlotState) => slot.kind === "video" || slot.kind === "media";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/avif,image/svg+xml";
const ACCEPT_VIDEO = "video/mp4,video/webm";

const isTooSmall = (slot: SlotState) =>
  !isVideo(slot) &&
  slot.actualWidth !== undefined &&
  slot.actualHeight !== undefined &&
  Math.max(slot.width / slot.actualWidth, slot.height / slot.actualHeight) > 1.02;

export function AdminImages() {
  const router = useRouter();
  const [slots, setSlots] = useState<SlotState[] | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Sessiya tugagan bo'lsa kirish sahifasiga qaytaramiz. */
  const handleAuth = useCallback(
    (res: Response) => {
      if (res.status === 401) {
        router.replace("/admin/login");
        return true;
      }
      return false;
    },
    [router],
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: "no-store", headers: HEADERS });
      if (handleAuth(res)) return;
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      setSlots((await res.json()).items);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, [handleAuth]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback(
    async (slot: SlotState, action: () => Promise<Response>) => {
      setStatus((s) => ({ ...s, [slot.id]: { kind: "busy" } }));
      try {
        const res = await action();
        if (handleAuth(res)) return;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

        setSlots((prev) =>
          prev?.map((s) =>
            s.id === slot.id
              ? {
                  ...s,
                  url: data.url,
                  bytes: data.bytes ?? s.bytes,
                  actualWidth: data.actualWidth,
                  actualHeight: data.actualHeight,
                  replaced: data.url !== s.path,
                  missing: false,
                }
              : s,
          ) ?? prev,
        );
        setStatus((s) => ({ ...s, [slot.id]: { kind: "ok" } }));
        setTimeout(() => setStatus((s) => ({ ...s, [slot.id]: { kind: "idle" } })), 2400);
      } catch (e) {
        setStatus((s) => ({
          ...s,
          [slot.id]: { kind: "error", text: e instanceof Error ? e.message : String(e) },
        }));
      }
    },
    [handleAuth],
  );

  const upload = useCallback(
    (slot: SlotState, file: File) => {
      const body = new FormData();
      body.set("id", slot.id);
      body.set("file", file);
      return mutate(slot, () => fetch(API, { method: "POST", body, headers: HEADERS }));
    },
    [mutate],
  );

  const restore = useCallback(
    (slot: SlotState) =>
      mutate(slot, () =>
        fetch(`${API}?id=${encodeURIComponent(slot.id)}`, { method: "DELETE", headers: HEADERS }),
      ),
    [mutate],
  );

  const logout = useCallback(async () => {
    await fetch("/api/admin/session", { method: "DELETE", headers: HEADERS });
    router.replace("/admin/login");
    router.refresh();
  }, [router]);

  const grouped = useMemo(() => {
    const map = new Map<string, SlotState[]>();
    for (const slot of slots ?? []) {
      const list = map.get(slot.group) ?? [];
      list.push(slot);
      map.set(slot.group, list);
    }
    return map;
  }, [slots]);

  const replaced = slots?.filter((s) => s.replaced).length ?? 0;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 border-b border-taupe/30 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
          <span className="text-lg font-semibold tracking-tight text-espresso">
            i<span className="text-gold-deep">Space</span> — rasmlar
          </span>

          {slots && (
            <span className="rounded-full bg-warm-white px-3 py-1 text-[12px] text-espresso-soft">
              {replaced} / {slots.length} almashtirilgan
            </span>
          )}

          <nav className="order-3 flex w-full flex-wrap gap-1.5 sm:order-none sm:w-auto">
            {slotGroups.map((g) =>
              grouped.get(g)?.length ? (
                <a
                  key={g}
                  href={`#g-${g}`}
                  className="rounded-full px-3 py-1.5 text-[12px] text-espresso-soft transition-colors hover:bg-warm-white hover:text-espresso"
                >
                  {g}
                </a>
              ) : null,
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="/ru"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-taupe/50 px-4 py-2 text-[13px] transition-colors hover:border-gold hover:text-gold-deep"
            >
              Sayt
              <ExternalLink size={13} strokeWidth={1.6} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-taupe/50 px-4 py-2 text-[13px] transition-colors hover:border-gold hover:text-gold-deep"
            >
              Chiqish
              <LogOut size={13} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <ol className="mt-6 grid gap-2 text-[13px] leading-relaxed text-espresso-soft sm:grid-cols-3">
          {[
            "Kerakli uyani toping — ular sayt bo'limlari bo'yicha guruhlangan.",
            "Rasmni tanlang yoki kartaga sudrab tashlang.",
            "Saytni yangilang — rasm darrov o'z joyida turadi.",
          ].map((text, i) => (
            <li key={i} className="flex gap-2.5 rounded-xl border border-taupe/25 bg-warm-white p-3.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-deep text-[11px] font-semibold text-warm-white">
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>

        {loadError && (
          <p className="mt-6 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <TriangleAlert size={15} strokeWidth={1.7} aria-hidden="true" />
            {loadError}
          </p>
        )}

        {!slots && !loadError && (
          <p className="mt-10 text-sm text-espresso-soft">Yuklanmoqda…</p>
        )}

        {slotGroups.map((group) => {
          const items = grouped.get(group);
          if (!items?.length) return null;
          return (
            <section key={group} id={`g-${group}`} className="mt-12 scroll-mt-28">
              <h2 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-espresso-soft uppercase">
                {group} <span className="font-normal text-taupe-text">{items.length}</span>
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    status={status[slot.id] ?? { kind: "idle" }}
                    onUpload={upload}
                    onRestore={restore}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function SlotCard({
  slot,
  status,
  onUpload,
  onRestore,
}: {
  slot: SlotState;
  status: Status;
  onUpload: (slot: SlotState, file: File) => void;
  onRestore: (slot: SlotState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const busy = status.kind === "busy";
  const tooSmall = isTooSmall(slot);

  const pick = (file?: File | null) => {
    if (file) onUpload(slot, file);
  };

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={[
          "group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-cream",
          "transition-shadow",
          dragging ? "ring-2 ring-gold ring-inset" : "",
        ].join(" ")}
      >
        {/*
          Ataylab oddiy `<img>`, `next/image` emas: bu ichki vosita, optimizatsiya
          kerak emas. Yuklangan fayl nomida mazmun xeshi bor, ya'ni URL
          o'zgaradi va hech qanday kesh eski rasmni ko'rsatmaydi.
        */}
        {/*
          Fayl yo'q bo'lsa `<img>` umuman chizilmaydi.
          Ilgari u baribir so'ralib, konsolni 404 lar bilan to'ldirardi:
          uya kontentda e'lon qilingan, lekin fayl hali yuklanmagan
          bo'lishi mumkin (masalan mahsulot hikoyasi bloklari). API
          buni `missing` bilan aytadi — shundan foydalanamiz.
        */}
        {slot.missing ? (
          <span className="grid size-full place-items-center text-taupe-text">
            {isVideo(slot) ? (
              <Film size={22} strokeWidth={1.4} aria-hidden="true" />
            ) : (
              <ImageUp size={22} strokeWidth={1.4} aria-hidden="true" />
            )}
          </span>
        ) : isVideo(slot) ? (
          /*
            `controls` YO'Q va `preload="metadata"`: bu ko'rish oynasi,
            pleyer emas. Karta bosilganda fayl tanlash oynasi ochilishi
            kerak — pleyer boshqaruvi bosishni o'zi yutib qo'yardi.
            Ko'rinadigan narsa — birinchi kadr.
          */
          <video
            src={slot.url}
            className="size-full object-contain"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={slot.url} alt="" className="size-full object-contain" loading="lazy" />
        )}

        <span className="absolute inset-0 grid place-items-center bg-espresso/0 opacity-0 transition-[background-color,opacity] group-hover:bg-espresso/45 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-white px-3.5 py-2 text-[12px] font-medium text-espresso">
            <ImageUp size={13} strokeWidth={1.7} aria-hidden="true" />
            {dragging
              ? "Shu yerga tashlang"
              : slot.kind === "media"
                ? "Rasm yoki video"
                : acceptsVideo(slot)
                  ? "Video tanlash"
                  : "Rasm tanlash"}
          </span>
        </span>

        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-cream/75">
            <LoaderCircle size={22} className="animate-spin text-gold-deep" aria-hidden="true" />
          </span>
        )}
        {status.kind === "ok" && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-espresso px-2.5 py-1 text-[11px] text-cream">
            <Check size={12} strokeWidth={2.2} aria-hidden="true" />
            saqlandi
          </span>
        )}
        {slot.replaced && status.kind !== "ok" && (
          <span className="absolute top-3 right-3 rounded-full bg-gold-deep px-2.5 py-1 text-[11px] text-warm-white">
            o‘zgartirilgan
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[13px] leading-snug font-medium text-espresso">{slot.label}</p>
        {/*
          Ilgari bu yerda faqat bitta o'lcham turardi va u ikki ma'noli edi:
          admin uni "yuklangan rasm shunday" deb tushunardi, aslida esa bu
          TALAB. Endi ikkalasi ham ko'rinadi — kerakli va hozirgi.
        */}
        <p className="mt-1.5 text-[11px] text-espresso-soft">
          {acceptsVideo(slot) ? (
            <>
              {slot.kind === "media" ? "Rasm yoki video" : "MP4 yoki WebM"} ·{" "}
              <span className="font-medium text-espresso">
                {slot.kind === "media" ? `${slot.width}×${slot.height}` : "64 MB gacha"}
              </span>{" "}
              · {formatBytes(slot.bytes)}
            </>
          ) : (
            <>
              Kerakli o‘lcham:{" "}
              <span className="font-medium text-espresso">
                {slot.width}×{slot.height}
              </span>{" "}
              · {formatBytes(slot.bytes)}
            </>
          )}
          {slot.missing && <span className="text-red-600"> · fayl yo‘q</span>}
        </p>

        {slot.actualWidth !== undefined && slot.actualHeight !== undefined && (
          <p
            className={`mt-1 text-[11px] ${tooSmall ? "text-amber-700" : "text-espresso-soft/85"}`}
          >
            Hozirgi rasm: {slot.actualWidth}×{slot.actualHeight}
          </p>
        )}

        {tooSmall && (
          <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
            <TriangleAlert size={12} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
            Rasm kerakligidan kichik — u cho‘zilib, donadorlashib ko‘rinadi. Kamida {slot.width}×
            {slot.height} bo‘lgan fayl yuklang.
          </p>
        )}

        {slot.hint && (
          <p className="mt-2 text-[11px] leading-relaxed text-espresso-soft/85">{slot.hint}</p>
        )}

        {status.kind === "error" && (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-[11px] text-red-600">
            <TriangleAlert size={12} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
            {status.text}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={
            slot.kind === "media"
              ? `${ACCEPT_IMAGE},${ACCEPT_VIDEO}`
              : acceptsVideo(slot)
                ? ACCEPT_VIDEO
                : ACCEPT_IMAGE
          }
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {slot.replaced && (
          <button
            type="button"
            onClick={() => onRestore(slot)}
            disabled={busy}
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-[12px] text-espresso-soft transition-colors hover:text-gold-deep disabled:opacity-50"
          >
            <RotateCcw size={12} strokeWidth={1.7} aria-hidden="true" />
            {isVideo(slot) ? "Yuklangan faylni o‘chirish" : "Dastlabki rasmni qaytarish"}
          </button>
        )}
      </div>
    </li>
  );
}
