"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";

type TabKey = "description" | "specs" | "delivery";

/**
 * Mahsulot ma'lumotlari — uch bo'lim.
 *
 * Maketda to'rtinchi «Отзывы» ilovasi ham bor edi, u ataylab olinmadi:
 * saytdagi sharhlar umumiy, muayyan mahsulotga bog'lanmagan. Ularni
 * mahsulot ichida ko'rsatish "shu model haqida" degan noto'g'ri
 * taassurot berardi. Sharhlar sahifaning pastida, o'z bo'limida turadi.
 *
 * Klaviatura: o'q tugmalari bilan ilovalar orasida yurish (WAI-ARIA
 * Tabs naqshi) — `Tab` esa ilovalar guruhidan panelga o'tadi.
 */
export function ProductTabs({ product }: { product: Product }) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const baseId = useId();

  const tabs = (
    [
      product.description ? "description" : null,
      product.specs?.length ? "specs" : null,
      product.delivery ? "delivery" : null,
    ].filter(Boolean) as TabKey[]
  );

  const [active, setActive] = useState<TabKey>(tabs[0]);

  if (tabs.length === 0) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.indexOf(active);
    if (e.key === "ArrowRight") setActive(tabs[(i + 1) % tabs.length]);
    else if (e.key === "ArrowLeft") setActive(tabs[(i - 1 + tabs.length) % tabs.length]);
    else return;
    e.preventDefault();
  };

  return (
    <div>
      {/*
        Tablar BITTA qatorda qoladi.

        `flex-wrap` da uchinchi tab telefonda ikkinchi qatorga tushib,
        ostidagi faol chiziq bilan aloqasini yo'qotardi: qaysi bo'lim
        ochiqligi ko'rinmay qolardi. Endi qator gorizontal suriladi —
        bu telefonda tanish harakat va chiziq doim o'z tabining
        ostida turadi.

        `-mx-*`/`px-*` juftligi surish maydonini konteyner chetlarigacha
        yoyadi: birinchi tab chetga yopishib qolmaydi, oxirgisi esa
        surilganda to'liq ko'rinadi.
      */}
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-taupe/30 px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((key) => {
          const selected = key === active;
          return (
            <button
              key={key}
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              type="button"
              onClick={() => setActive(key)}
              className={[
                "-mb-px shrink-0 border-b-2 px-4 py-3 text-[14px] whitespace-nowrap transition-colors duration-300",
                selected
                  ? "border-gold text-espresso"
                  : "border-transparent text-espresso-soft/85 hover:text-espresso",
              ].join(" ")}
            >
              {t(`tabs.${key}`)}
            </button>
          );
        })}
      </div>

      {tabs.map((key) => (
        <div
          key={key}
          role="tabpanel"
          id={`${baseId}-panel-${key}`}
          aria-labelledby={`${baseId}-tab-${key}`}
          hidden={key !== active}
          className="pt-6"
        >
          {/*
            `whitespace-pre-line` — admin qatorlarni qanday tashlagan
            bo'lsa, shunday ko'rinadi. Usiz HTML barcha qator
            tashlashlarni oddiy bo'sh joyga aylantiradi va uzun matn
            yagona blokka yopishib qoladi.
          */}
          {key === "description" && product.description && (
            <p className="measure text-sm leading-relaxed whitespace-pre-line text-espresso-soft">
              {pick(product.description, locale)}
            </p>
          )}

          {key === "specs" && product.specs && (
            <dl className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
              {product.specs.map((row) => (
                <div
                  key={pick(row.label, locale)}
                  className="flex items-baseline justify-between gap-4 border-b border-taupe/25 py-3"
                >
                  <dt className="text-[14px] text-espresso-soft/85">{pick(row.label, locale)}</dt>
                  <dd className="text-[14px] text-espresso">{pick(row.value, locale)}</dd>
                </div>
              ))}
            </dl>
          )}

          {key === "delivery" && product.delivery && (
            <p className="measure text-sm leading-relaxed text-espresso-soft">
              {pick(product.delivery, locale)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
