"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag, Trash2, X } from "lucide-react";
import type { Category, LocaleString, Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { useShop } from "@/store/useShop";

/**
 * Solishtirish jadvali.
 *
 * Asosiy qoida: **faqat bir kategoriyadagi tovarlar solishtiriladi**.
 * Massaj kreslosi bilan yugurish yo'lakchasining xarakteristikalari
 * umuman kesishmaydi — ularni bir jadvalga qo'yish bo'sh kataklar
 * to'rini beradi va hech qanday qaror qabul qilishga yordam bermaydi.
 * Shuning uchun ro'yxat kategoriyalarga bo'linadi va ekranda bir vaqtda
 * BITTASI ko'rsatiladi; qolganlari yuqoridagi cheplarda turadi.
 *
 * Qatorlar kontentdan HOSIL QILINADI, qo'lda yozilmaydi: `specs` dagi
 * yorliqlar bo'yicha birlashtiriladi. Ya'ni admin yangi xarakteristika
 * qo'shsa, u jadvalda o'zidan paydo bo'ladi.
 */

type Row = {
  key: string;
  label: string;
  /** Har ustun uchun qiymat; `null` — bu tovarda bunday xarakteristika yo'q. */
  values: (string | null)[];
};

/**
 * Qatorlarni birlashtirish kaliti.
 *
 * Yorliqning RU varianti olinadi va normallashtiriladi: uch tilda ham
 * bir xil qator bitta bo'lib turishi kerak, admin esa yorliqni bo'sh
 * joy yoki registr bilan boshqacha yozishi mumkin.
 */
const specKey = (label: LocaleString) => label.ru.trim().toLowerCase().replace(/\s+/g, " ");

export function CompareBoard({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const t = useTranslations("compare");
  const tp = useTranslations("products");
  const locale = useLocale() as Locale;

  const ids = useShop((s) => s.compare);
  const hydrated = useShop((s) => s.hydrated);
  const removeFromCompare = useShop((s) => s.removeFromCompare);
  const removeManyFromCompare = useShop((s) => s.removeManyFromCompare);
  const clearCompare = useShop((s) => s.clearCompare);
  const addToCart = useShop((s) => s.addToCart);

  const [onlyDiff, setOnlyDiff] = useState(false);
  /** `null` — hali tanlanmagan; birinchi guruh o'zidan faollashadi. */
  const [tab, setTab] = useState<string | null>(null);

  /*
   * Tanlanganlar TARTIBI saqlanadi: foydalanuvchi qaysi tovarni oldin
   * qo'shgan bo'lsa, ustun ham shu tartibda turadi. `ids.map` aynan
   * shuning uchun — `products.filter` bo'lsa katalog tartibi chiqardi.
   */
  const chosen = useMemo(
    () => ids.map((id) => products.find((p) => p._id === id)).filter((p): p is Product => Boolean(p)),
    [ids, products],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of chosen) {
      map.set(product.category, [...(map.get(product.category) ?? []), product]);
    }
    return [...map.entries()].map(([slug, items]) => ({
      slug,
      title: categories.find((c) => c.slug === slug)?.title,
      items,
    }));
  }, [chosen, categories]);

  const active = groups.find((g) => g.slug === tab) ?? groups[0];

  const rows = useMemo<Row[]>(() => {
    if (!active) return [];
    const items = active.items;

    const base: Row[] = [
      {
        key: "price",
        label: t("rows.price"),
        values: items.map((p) => formatPrice(p.price, locale)),
      },
      {
        key: "brand",
        label: t("rows.brand"),
        values: items.map((p) => p.brand ?? null),
      },
      {
        key: "rating",
        label: t("rows.rating"),
        values: items.map((p) => (p.rating ? p.rating.toFixed(1) : null)),
      },
      {
        key: "stock",
        label: t("rows.stock"),
        // `inStock` berilmagani "mavjud" degani — `Product` izohidagi kelishuv.
        values: items.map((p) => (p.inStock === false ? t("rows.outOfStock") : t("rows.inStock"))),
      },
      {
        key: "colors",
        label: t("rows.colors"),
        values: items.map((p) =>
          p.colors?.length ? p.colors.map((c) => pick(c.label, locale)).join(", ") : null,
        ),
      },
    ];

    /*
     * `specs` qatorlari BIRLASHTIRILADI: kalitlar birinchi uchragan
     * tartibda yig'iladi, so'ng har ustun o'z qiymatini beradi. Bir
     * tovarda bor, ikkinchisida yo'q xarakteristika — bo'sh katak,
     * qator esa baribir qoladi: "yo'q" ham ma'lumot.
     */
    const specLabels = new Map<string, LocaleString>();
    for (const product of items) {
      for (const spec of product.specs ?? []) {
        const key = specKey(spec.label);
        if (!specLabels.has(key)) specLabels.set(key, spec.label);
      }
    }

    const specRows: Row[] = [...specLabels.entries()].map(([key, label]) => ({
      key: `spec-${key}`,
      label: pick(label, locale),
      values: items.map((p) => {
        const hit = p.specs?.find((s) => specKey(s.label) === key);
        return hit ? pick(hit.value, locale) : null;
      }),
    }));

    const all = [...base, ...specRows];

    // Bo'sh qator ko'rsatilmaydi: hech bir tovarda qiymati yo'q.
    const filled = all.filter((row) => row.values.some((v) => v !== null && v !== ""));

    if (!onlyDiff) return filled;
    return filled.filter((row) => new Set(row.values.map((v) => v ?? "")).size > 1);
  }, [active, locale, onlyDiff, t]);

  /* --- bo'sh holat --- */
  if (!hydrated) {
    // Server 0 chizadi; `StoreProvider` rehydrate qilmaguncha ham shunday.
    return <div className="container-lux py-16" aria-hidden="true" />;
  }

  if (!active) {
    return (
      <div className="container-lux py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-taupe/30 bg-warm-white p-10 text-center">
          <p className="font-display text-xl text-espresso">{t("empty")}</p>
          <p className="mt-3 text-sm leading-relaxed text-espresso-soft">{t("emptyText")}</p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-gold-deep px-6 text-[14px] font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover"
          >
            {t("toCatalog")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-lux pb-20">
      {/* ---- kategoriya cheplari ---- */}
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((group) => {
          const on = group.slug === active.slug;
          return (
            <span
              key={group.slug}
              className={[
                "inline-flex items-center gap-1 rounded-full border text-[13px] transition-colors duration-300",
                on
                  ? "border-gold/60 bg-gold/12 text-gold-ink"
                  : "border-taupe/40 bg-warm-white text-espresso-soft hover:border-gold/50",
              ].join(" ")}
            >
              <button type="button" onClick={() => setTab(group.slug)} className="py-2 pl-4">
                {group.title ? pick(group.title, locale) : group.slug}
                <span className="ml-1.5 text-espresso-soft/70">{group.items.length}</span>
              </button>
              {/*
                Chepdagi "×" — BUTUN kategoriyani ro'yxatdan chiqaradi.
                Maketda ham shunday: guruh keraksiz bo'lsa uni bitta
                harakat bilan olib tashlash kerak, har ustunni alohida
                emas.
              */}
              <button
                type="button"
                onClick={() => removeManyFromCompare(group.items.map((p) => p._id))}
                aria-label={t("removeGroup")}
                className="py-2 pr-3.5 pl-1 text-espresso-soft/70 transition-colors duration-300 hover:text-rosewood"
              >
                <X size={12} strokeWidth={2} aria-hidden="true" />
              </button>
            </span>
          );
        })}

        <span className="ms-auto flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-espresso-soft">
            <input
              type="checkbox"
              checked={onlyDiff}
              onChange={(e) => setOnlyDiff(e.target.checked)}
              className="size-4 accent-[var(--color-gold-deep)]"
            />
            {t("onlyDiff")}
          </label>

          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex items-center gap-1.5 text-[13px] text-espresso-soft transition-colors duration-300 hover:text-rosewood"
          >
            <Trash2 size={13} strokeWidth={1.7} aria-hidden="true" />
            {t("clear")}
          </button>
        </span>
      </div>

      {/*
        Jadval gorizontal scroll ichida.

        Ustun kengligi SOBIT: telefonda ikkitasi ko'rinadi va qolganiga
        suriladi. Ustunlarni ekranga siqish — nomlar ham, narx ham
        o'qilmaydigan bo'lib qolishi demak.

        Yorliq ustuni `sticky left-0`: qator nomi ko'z oldida qoladi,
        aks holda o'ngga surilganda qaysi xarakteristika ekani yo'qoladi.
      */}
      <div className="mt-6 overflow-x-auto pb-2">
        <table className="w-max border-collapse text-sm">
          <caption className="sr-only">{t("title")}</caption>

          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-[2] w-[9.5rem] min-w-[9.5rem] bg-cream align-bottom sm:w-44 sm:min-w-44"
              >
                <span className="sr-only">{t("title")}</span>
              </th>

              {active.items.map((product) => {
                const image = product.images[0];
                return (
                  <th
                    key={product._id}
                    scope="col"
                    className="w-[15rem] min-w-[15rem] p-2 align-top sm:w-64 sm:min-w-64"
                  >
                    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white text-start">
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product._id)}
                        aria-label={t("remove")}
                        className="absolute top-2.5 right-2.5 z-[2] grid size-8 place-items-center rounded-full bg-warm-white/85 text-espresso-soft backdrop-blur-sm transition-colors duration-300 hover:text-rosewood"
                      >
                        <X size={14} strokeWidth={1.8} aria-hidden="true" />
                      </button>

                      <Link href={`/catalog/${product.slug}`} className="group block">
                        <span className="relative block aspect-square overflow-hidden bg-cream">
                          {image && (
                            <Image
                              src={image.src}
                              alt={pick(image.alt, locale)}
                              fill
                              quality={IMAGE_QUALITY}
                              sizes="256px"
                              style={mediaFit(image).style}
                              className={`${mediaFit(image).className} transition-transform duration-700 group-hover:scale-105`}
                            />
                          )}
                          {product.isNew && (
                            <span className="absolute top-3 left-3 rounded-full bg-rosewood px-2.5 py-1 text-[11px] tracking-[0.12em] text-cream uppercase">
                              {tp("new")}
                            </span>
                          )}
                        </span>

                        <span className="line-clamp-2 block px-4 pt-4 text-[14px] leading-snug font-normal text-espresso transition-colors duration-300 group-hover:text-gold-ink">
                          {pick(product.title, locale)}
                        </span>
                      </Link>

                      <div className="mt-auto flex items-end justify-between gap-2 p-4">
                        <span>
                          {product.oldPrice && (
                            <s className="block text-[12px] font-normal text-rosewood/85">
                              {formatPrice(product.oldPrice, locale)}
                            </s>
                          )}
                          <span className="font-display block text-[18px] text-espresso">
                            {formatPrice(product.price, locale)}
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => addToCart(product._id)}
                          aria-label={tp("addToCart")}
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-deep text-warm-white transition-colors duration-300 hover:bg-gold-hover"
                        >
                          <ShoppingBag size={15} strokeWidth={1.6} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-taupe/25 align-top">
                <th
                  scope="row"
                  className="sticky left-0 z-[1] bg-cream py-3.5 pr-4 text-start text-[13px] leading-snug font-normal text-espresso-soft"
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={`${row.key}-${active.items[i]._id}`}
                    className="px-4 py-3.5 text-[14px] leading-snug text-espresso"
                  >
                    {value ?? <span className="text-taupe-text">{t("dash")}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="mt-8 rounded-2xl border border-taupe/30 bg-warm-white px-6 py-8 text-center text-sm text-espresso-soft">
          {t("noDiff")}
        </p>
      )}

      {/* Katalogga qaytish — jadval oxirida, tanlashni davom ettirish uchun. */}
      <div className="mt-10">
        <Link
          href="/catalog"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-taupe/70 bg-warm-white/60 px-5 text-sm font-medium text-espresso transition-colors duration-300 hover:border-gold hover:text-gold-deep"
        >
          {t("toCatalog")}
        </Link>
      </div>
    </div>
  );
}
