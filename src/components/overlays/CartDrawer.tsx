"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useShop } from "@/store/useShop";
import { useUi } from "@/store/useUi";
import { Drawer } from "./Drawer";
import { Button } from "@/components/ui/Button";

export function CartDrawer({ products }: { products: Product[] }) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const open = useUi((s) => s.overlay === "cart");
  const close = useUi((s) => s.close);

  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const removeFromCart = useShop((s) => s.removeFromCart);

  const lines = cart
    .map((line) => ({ line, product: products.find((p) => p._id === line.productId) }))
    .filter((x): x is { line: (typeof cart)[number]; product: Product } => Boolean(x.product));

  const total = lines.reduce((sum, { line, product }) => sum + line.qty * product.price, 0);
  const count = lines.reduce((sum, { line }) => sum + line.qty, 0);

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t("title")}
      meta={lines.length ? t("items", { count }) : undefined}
      footer={
        lines.length ? (
          <>
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm text-espresso-soft">{t("total")}</span>
              <span className="font-display text-2xl text-espresso">
                {formatPrice(total, locale)}
              </span>
            </div>
            <Button variant="gold" size="lg" withArrow className="w-full">
              {t("checkout")}
            </Button>
          </>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <EmptyState title={t("empty")} hint={t("emptyHint")} />
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {lines.map(({ line, product }) => (
              <motion.li
                key={product._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: DUR.ui, ease: EASE_LUX }}
                className="flex gap-3"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <Image
                    src={product.images[0].src}
                    alt={pick(product.images[0].alt, locale)}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14px] leading-snug text-espresso">
                    {pick(product.title, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gold-deep">
                    {formatPrice(product.price, locale)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <QtyButton
                      label={t("decrease")}
                      onClick={() => setQty(product._id, line.qty - 1)}
                    >
                      <Minus size={13} strokeWidth={2} aria-hidden="true" />
                    </QtyButton>
                    <span className="w-6 text-center text-sm">
                      {/* Rolsiz elementda `aria-label` taqiqlangan — kontekst
                          ko'rinmas matn bilan beriladi. */}
                      <span className="sr-only">{t("quantity")}: </span>
                      {line.qty}
                    </span>
                    <QtyButton
                      label={t("increase")}
                      onClick={() => setQty(product._id, line.qty + 1)}
                    >
                      <Plus size={13} strokeWidth={2} aria-hidden="true" />
                    </QtyButton>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={t("remove")}
                  onClick={() => removeFromCart(product._id)}
                  className="size-7 shrink-0 self-start rounded-full text-taupe-text transition-colors duration-300 hover:bg-cream hover:text-espresso"
                >
                  <X size={14} strokeWidth={1.6} aria-hidden="true" className="mx-auto" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  );
}

function QtyButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-full border border-taupe/45 text-espresso-soft transition-colors duration-300 hover:border-gold hover:text-gold"
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display text-lg text-espresso">{title}</p>
      <p className="max-w-56 text-xs leading-relaxed text-espresso-soft">{hint}</p>
    </div>
  );
}
