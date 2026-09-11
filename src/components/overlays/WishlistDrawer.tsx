"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { firstImage, mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useShop } from "@/store/useShop";
import { useUi } from "@/store/useUi";
import { useToast } from "@/store/useToast";
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
  const moveWishlistToCart = useShop((s) => s.moveWishlistToCart);
  const cart = useShop((s) => s.cart);
  const openOverlay = useUi((s) => s.open);
  const toast = useToast();
  const tt = useTranslations("toast");

  const items = wishlist
    .map((id) => products.find((p) => p._id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t("title")}
      meta={items.length ? t("items", { count: items.length }) : undefined}
      footer={
        /*
          Hammasini savatga KO'CHIRADI.

          Saralanganlar — "keyin olaman" ro'yxati, ya'ni qaror qabul
          qilingan lahzada foydalanuvchi ularni bittalab bosishni
          xohlamaydi.

          Nusxa olish emas, ko'chirish: mahsulot savatga tushgandan
          keyin uni saralanganlarda ham ushlab turish ikki xil holat
          yaratadi va ro'yxat tozalanmagani "qo'shilmadi" degan
          taassurot berardi.
        */
        items.length ? (
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={() => {
              const count = items.length;
              moveWishlistToCart();
              /*
                Bu yerda savat ATAYLAB ochiladi: bu "yig'ish tugadi"
                qadami va foydalanuvchi keyingi harakatni savatda
                qiladi. Alohida qo'shishda esa faqat xabarnoma.
              */
              openOverlay("cart");
              toast.push({ message: tt("movedToCart", { count }), tone: "success" });
            }}
          >
            <ShoppingBag size={17} strokeWidth={1.6} aria-hidden="true" />
            {t("addAll")}
          </Button>
        ) : undefined
      }
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
                {/* Rasm `mediaFit` bo'yicha — qattiq `cover` buyumni kesardi. */}
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {(() => {
                    const media = firstImage(product.images) ?? product.images[0];
                    if (!media) return null;
                    const fit = mediaFit(media);
                    return (
                      <Image
                        src={media.src}
                        alt={pick(media.alt, locale)}
                        fill
                        quality={IMAGE_QUALITY}
                        sizes="80px"
                        style={fit.style}
                        className={fit.className}
                      />
                    );
                  })()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14px] leading-snug text-espresso">
                    {pick(product.title, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gold-deep">
                    {formatPrice(product.price, locale)}
                  </p>
                  {/*
                    Alohida tugma savatni OCHMAYDI: bu yerda
                    foydalanuvchi ro'yxatni ko'zdan kechiryapti va
                    har bosishda panel almashsa, ish uzilib qolardi.
                    Javob joyida beriladi — yozuv "Savatda" ga
                    aylanadi.

                    Tugma O'CHIRILMAYDI. Ilgari u savatda bor
                    mahsulotda `disabled` bo'lardi va "hammasini
                    savatga" bosilgandan keyin hamma tugma bir vaqtda
                    o'lik bo'lib qolardi — bu ishlamayotgandek
                    ko'rinardi. Mahsulot sahifasidagi tugma ham
                    shunday: yozuvi o'zgaradi, o'zi ishlayveradi.
                  */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      addToCart(product._id);
                      toast.push({ message: tt("addedToCart"), tone: "success" });
                    }}
                  >
                    {cart.some((l) => l.productId === product._id)
                      ? t("inCart")
                      : t("addToCart")}
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
