"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useUi } from "@/store/useUi";
import { useShop } from "@/store/useShop";
import { Drawer } from "./Drawer";
import { EmptyState } from "./CartDrawer";
import { Button } from "@/components/ui/Button";

/**
 * Katalog bo'yicha qidiruv. Bu bosqichda mahsulotlar ro'yxati kichik va
 * to'liq client'da bo'lgani uchun filtrlash ham client'da — server so'rovi
 * kerak emas.
 */
export function SearchDrawer({ products }: { products: Product[] }) {
  const t = useTranslations("header");
  const tp = useTranslations("products");
  const tb = useTranslations("blog");
  const locale = useLocale() as Locale;

  const open = useUi((s) => s.overlay === "search");
  const close = useUi((s) => s.close);
  const addToCart = useShop((s) => s.addToCart);

  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [pick(p.title, locale), ...p.features.map((f) => pick(f.label, locale))]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [products, query, locale]);

  return (
    <Drawer open={open} onClose={close} title={t("search")}>
      <label className="relative mb-5 block">
        <span className="sr-only">{t("searchPlaceholder")}</span>
        <Search
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-taupe-text"
        />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-12 w-full rounded-full border border-taupe/45 bg-warm-white pr-4 pl-11 text-sm text-espresso transition-colors duration-300 outline-none hover:border-taupe focus:border-gold"
        />
      </label>

      {results.length === 0 ? (
        <EmptyState title={tb("empty")} hint={t("searchPlaceholder")} />
      ) : (
        <ul className="space-y-4">
          {results.map((product, i) => (
            <motion.li
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.ui, ease: EASE_LUX, delay: i * 0.04 }}
              className="flex gap-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                <Image
                  src={product.images[0].src}
                  alt={pick(product.images[0].alt, locale)}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[14px] leading-snug text-espresso">
                  {pick(product.title, locale)}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gold-deep">
                  {formatPrice(product.price, locale)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-center"
                onClick={() => addToCart(product._id)}
              >
                {tp("addToCart")}
              </Button>
            </motion.li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
