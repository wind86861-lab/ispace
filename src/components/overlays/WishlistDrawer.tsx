"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useShop } from "@/store/useShop";
import { useUi } from "@/store/useUi";
import { Drawer } from "./Drawer";
import { EmptyState } from "./CartDrawer";
import { Button } from "@/components/ui/Button";

export function WishlistDrawer({ products }: { products: Product[] }) {
  const t = useTranslations("wishlist");
  const locale = useLocale() as Locale;
  const open = useUi((s) => s.overlay === "wishlist");
  const close = useUi((s) => s.close);

  const wishlist = useShop((s) => s.wishlist);
  const removeFromWishlist = useShop((s) => s.removeFromWishlist);
  const addToCart = useShop((s) => s.addToCart);

  const items = wishlist
    .map((id) => products.find((p) => p._id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t("title")}
      meta={items.length ? t("items", { count: items.length }) : undefined}
    >
      {items.length === 0 ? (
        <EmptyState title={t("empty")} hint={t("emptyHint")} />
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((product) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => addToCart(product._id)}
                  >
                    {t("addToCart")}
                  </Button>
                </div>

                <button
                  type="button"
                  aria-label={t("remove")}
                  onClick={() => removeFromWishlist(product._id)}
                  className="size-7 shrink-0 self-start rounded-full text-gold transition-colors duration-300 hover:bg-cream"
                >
                  <Heart size={15} strokeWidth={1.6} fill="currentColor" aria-hidden="true" className="mx-auto" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  );
}
