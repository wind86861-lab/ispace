"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Heart, Scale, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Badge, Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { formatPrice } from "@/lib/format";
import { SPRING } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBadges } from "./ProductBadges";
import { useShop } from "@/store/useShop";

/**
 * Katalog kartasi.
 *
 * Bosh sahifadagi kartadan farqi — u BUTUNLAY havola: rasm ham, nom ham
 * mahsulot sahifasiga olib boradi. Savat va saralangan tugmalari havola
 * ichida emas, uning yonida turadi: aks holda ular bosilganda brauzer
 * sahifaga o'tib ketardi.
 */
export function ProductCard({
  product,
  badges = [],
  index = 0,
}: {
  product: Product;
  /** Mahsulotda yoqilgan nishonlar — rasm ustida ko'rinadi. */
  badges?: Badge[];
  index?: number;
}) {
  const t = useTranslations("products");
  const tc = useTranslations("compare");
  const locale = useLocale() as Locale;
  const { pointerFx } = useMediaTier();
  const ref = useRef<HTMLElement>(null);

  /*
   * Kursorga ergashadigan 3D egilish — bosh sahifadagi karta bilan AYNAN
   * bir xil. Ilgari katalogdagi karta bunday harakatga ega emas edi va
   * bitta mahsulot ikki joyda boshqacha "his" berardi: bosh sahifada
   * tirik, katalogda yassi.
   *
   * `pointerFx` — faqat sichqoncha kabi aniq ko'rsatkichda. Sensorli
   * ekranda egilish ma'nosiz: barmoq kartani bosib turadi, "uzoqdan
   * kuzatish" holati umuman yo'q.
   */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), SPRING);

  const onMove = (e: React.PointerEvent) => {
    if (!pointerFx || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const addToCart = useShop((s) => s.addToCart);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const toggleCompare = useShop((s) => s.toggleCompare);
  const hydrated = useShop((s) => s.hydrated);
  const inCart = useShop((s) => s.cart.some((l) => l.productId === product._id));
  const inWishlist = useShop((s) => s.wishlist.includes(product._id));
  const inCompare = useShop((s) => s.compare.includes(product._id));

  const image = product.images[0];

  return (
    <Reveal delay={(index % 3) * 0.07} y={24} className="h-full">
      <motion.article
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={
          pointerFx
            ? { rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1100 }
            : undefined
        }
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white transition-[border-color,box-shadow] duration-500 hover:border-gold/45 hover:shadow-[0_16px_50px_-30px_rgba(41,34,30,0.55)]"
      >
        <div className="relative aspect-square overflow-hidden bg-cream">
          <Image
            src={image.src}
            alt={pick(image.alt, locale)}
            fill
            quality={IMAGE_QUALITY}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={mediaFit(image).style}
            className={`${mediaFit(image).className} transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.06]`}
          />

          <ProductBadges
            badges={badges}
            locale={locale}
            belowRibbon={Boolean(product.isNew)}
          />

          {product.isNew && (
            <span className="absolute top-3.5 left-3.5 rounded-full bg-rosewood px-2.5 py-1 text-[11px] tracking-[0.12em] text-cream uppercase">
              {t("new")}
            </span>
          )}

          {/*
            Ikkita tugma bitta ustunda: yurakcha va solishtirish. Ular
            havolaning USTIDA (`z-[2]`) turadi — karta butunlay havola
            bo'lgani uchun aks holda bosish mahsulot sahifasiga ketardi.
          */}
          <span className="absolute top-3 right-3 z-[2] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleWishlist(product._id)}
              aria-label={hydrated && inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
              aria-pressed={hydrated && inWishlist}
              className="grid size-9 place-items-center rounded-full bg-warm-white/85 backdrop-blur-sm transition-colors duration-300 hover:bg-warm-white"
            >
              <Heart
                size={16}
                strokeWidth={1.6}
                aria-hidden="true"
                className={hydrated && inWishlist ? "text-rosewood" : "text-espresso-soft"}
                fill={hydrated && inWishlist ? "currentColor" : "none"}
              />
            </button>

            <button
              type="button"
              onClick={() => toggleCompare(product._id)}
              aria-label={hydrated && inCompare ? tc("remove") : tc("add")}
              aria-pressed={hydrated && inCompare}
              className={[
                "grid size-9 place-items-center rounded-full backdrop-blur-sm transition-colors duration-300",
                hydrated && inCompare
                  ? "bg-gold-deep text-warm-white"
                  : "bg-warm-white/85 text-espresso-soft hover:bg-warm-white",
              ].join(" ")}
            >
              <Scale size={15} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-sans line-clamp-2 text-[15px] leading-snug text-espresso">
            {/*
              Kengaytirilgan bosish maydoni: havola butun kartani qoplaydi
              (`after:absolute after:inset-0`), lekin yurakcha va savat
              tugmalari undan yuqorida (`z-[2]`) turadi.
            */}
            <Link
              href={`/catalog/${product.slug}`}
              className="transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:text-gold-ink"
            >
              {pick(product.title, locale)}
            </Link>
          </h3>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              {product.oldPrice && (
                <p className="text-[12px] text-rosewood/85">
                  <span className="sr-only">{t("oldPriceAria")}: </span>
                  <s>{formatPrice(product.oldPrice, locale)}</s>
                </p>
              )}
              <p className="font-display text-lg text-espresso">
                {formatPrice(product.price, locale)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => addToCart(product._id)}
              className={[
                "relative z-[2] inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium",
                "transition-[background-color,color] duration-300",
                hydrated && inCart
                  ? "bg-espresso text-cream hover:bg-espresso-soft"
                  : "bg-gold-deep text-warm-white hover:bg-gold-hover",
              ].join(" ")}
            >
              <ShoppingBag size={14} strokeWidth={1.6} aria-hidden="true" />
              {hydrated && inCart ? t("inCart") : t("addToCart")}
            </button>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}
