"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Check, ChevronDown, Heart, Scale, ShoppingBag } from "lucide-react";
import type { Badge, Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_LUX, SPRING } from "@/lib/motion";
import { useMediaTier } from "@/hooks/useMediaTier";
import { useShop, selectInCart, selectInWishlist, selectInCompare } from "@/store/useShop";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBadges } from "@/components/catalog/ProductBadges";
import { Button } from "@/components/ui/Button";

type SortKey = "popular" | "priceAsc" | "priceDesc" | "newest";
const SORT_KEYS: SortKey[] = ["popular", "priceAsc", "priceDesc", "newest"];

export function Products({ products, badges = [] }: { products: Product[]; badges?: Badge[] }) {
  const t = useTranslations("products");
  const [sort, setSort] = useState<SortKey>("popular");

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "priceAsc":
        return list.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
        return list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false) || a.rank - b.rank);
      default:
        return list.sort((a, b) => a.rank - b.rank);
    }
  }, [products, sort]);

  return (
    <section id="products" className="scroll-mt-28 bg-alabaster py-20 sm:py-24 border-y border-taupe/25">
      <div className="container-lux">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <Reveal className="mt-8 flex justify-end">
          <SortSelect value={sort} onChange={setSort} />
        </Reveal>

        {/* `LayoutGroup` — saralashda kartalar yangi joyiga siljib boradi
            (§10: layout animation — Motion hududi). */}
        <LayoutGroup>
          <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {sorted.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={i}
                  badges={badges.filter((b) => product.badgeIds?.includes(b._id))}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const t = useTranslations("products");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-10 items-center gap-2 rounded-full border border-taupe/45 bg-warm-white px-4 text-[14px] text-espresso-soft transition-colors duration-300 hover:border-gold hover:text-espresso"
      >
        <span className="text-taupe-text">{t("sortLabel")}:</span>
        {t(`sort.${value}`)}
        <ChevronDown
          size={14}
          strokeWidth={1.6}
          aria-hidden="true"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Tashqariga bosilganda yopiladi. */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: DUR.micro, ease: EASE_LUX }}
              className="absolute top-12 right-0 z-20 w-56 overflow-hidden rounded-xl border border-taupe/35 bg-warm-white p-1 shadow-xl"
            >
              {SORT_KEYS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={key === value}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors duration-200",
                      key === value
                        ? "bg-cream text-gold"
                        : "text-espresso-soft hover:bg-cream hover:text-espresso",
                    ].join(" ")}
                  >
                    <Check
                      size={13}
                      strokeWidth={2}
                      aria-hidden="true"
                      className={key === value ? "opacity-100" : "opacity-0"}
                    />
                    {t(`sort.${key}`)}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ProductCard({
  product,
  index,
  badges,
}: {
  product: Product;
  index: number;
  badges: Badge[];
}) {
  const t = useTranslations("products");
  const tc = useTranslations("compare");
  const locale = useLocale() as Locale;
  const { pointerFx } = useMediaTier();
  const ref = useRef<HTMLDivElement>(null);

  const inCart = useShop(selectInCart(product._id));
  const inWishlist = useShop(selectInWishlist(product._id));
  const inCompare = useShop(selectInCompare(product._id));
  const hydrated = useShop((s) => s.hydrated);
  const addToCart = useShop((s) => s.addToCart);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const toggleCompare = useShop((s) => s.toggleCompare);

  /* ---- 3D tilt (§2 — faqat fine pointer) ---- */
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

  return (
    /*
      Kirish animatsiyasi Motion'ning `whileInView` iga emas, umumiy
      `<Reveal>` ga topshirilgan.

      Sabab: `whileInView` + `once: false` kirish va chiqishni bitta
      chegarada tekshiradi, animatsiyaning o'zi esa elementni 24px
      siljitadi — natijada chegara yonida "kirdim-chiqdim" sikli
      boshlanadi va karta hech qachon to'xtamaydi. `Reveal` ochilishni
      82% chizig'ida, tiklanishni esa faqat element BUTUNLAY ekrandan
      chiqqanda qiladi; shu asimmetriya siklni imkonsiz qiladi.

      Motion bu yerda faqat `layout` va `exit` uchun qoladi (saralash va
      filtr) — ular pozitsiyani boshqaradi, kirishni emas.
    */
    <motion.li
      layout
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: DUR.reveal, ease: EASE_LUX }}
      style={{ perspective: pointerFx ? 1100 : undefined }}
    >
      <Reveal delay={(index % 3) * 0.07} y={24} className="h-full">
      <motion.article
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={pointerFx ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-taupe/30 bg-warm-white transition-[border-color,box-shadow] duration-500 hover:border-gold/45 hover:shadow-[0_16px_50px_-30px_rgba(41,34,30,0.55)]"
      >
        <div className="relative aspect-square overflow-hidden bg-cream">
          <Image
            src={product.images[0].src}
            alt={pick(product.images[0].alt, locale)}
            fill
            quality={IMAGE_QUALITY}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={mediaFit(product.images[0]).style}
            className={`${mediaFit(product.images[0]).className} transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.06]`}
          />

          <ProductBadges
            badges={badges}
            locale={locale}
            belowRibbon={Boolean(product.isNew)}
          />

          {product.isNew && (
            <span className="absolute top-3.5 left-3.5 overflow-hidden rounded-full bg-rosewood px-2.5 py-1 text-[11px] tracking-[0.12em] text-cream uppercase">
              {t("new")}
              {/* Oltin yorug'lik belgidan o'tib turadi. */}
              <span
                aria-hidden="true"
                className="animate-shimmer pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent"
              />
            </span>
          )}

          {/* Yurakcha va solishtirish bitta ustunda — katalog kartasi
              bilan bir xil joyda va bir xil tartibda. */}
          <span className="absolute top-3 right-3 z-[2] flex flex-col gap-2">
            <RoundButton
              active={hydrated && inWishlist}
              label={inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
              onClick={() => toggleWishlist(product._id)}
            >
              {(on) => (
                <Heart
                  size={16}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className={on ? "text-rosewood" : "text-espresso-soft"}
                  fill={on ? "currentColor" : "none"}
                />
              )}
            </RoundButton>

            <RoundButton
              active={hydrated && inCompare}
              label={hydrated && inCompare ? tc("remove") : tc("add")}
              onClick={() => toggleCompare(product._id)}
              activeClassName="bg-gold-deep hover:bg-gold-hover"
            >
              {(on) => (
                <Scale
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className={on ? "text-warm-white" : "text-espresso-soft"}
                />
              )}
            </RoundButton>
          </span>
        </div>

        {/*
          Karta ichidagi matn ham o'z ritmiga ega: nom → xususiyatlar →
          narx ketma-ket chiqadi. Karta o'zi `opacity/transform` bilan,
          ichki guruh esa alohida elementlarda ishlaydi — bir xossani ikki
          joydan yozish yo'q.
        */}
        <Reveal stagger={0.08} delay={0.14} className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-sans line-clamp-2 text-[15px] leading-snug text-espresso">
            {/*
              Karta BUTUNLAY havola: `after:absolute after:inset-0`
              nomdan tashqariga cho'ziladi va butun kartani qoplaydi.
              Katalog kartasida ham aynan shu usul.

              Yurakcha, solishtirish va savat tugmalari undan YUQORIDA
              (`z-[2]`) turadi, aks holda ular bosilganda brauzer
              mahsulot sahifasiga o'tib ketardi.
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
                  {/* `aria-label` rolsiz <p> da taqiqlangan — kontekstni
                      ko'rinmas matn bilan beramiz, u chizilgan narxni
                      ekran o'quvchi uchun izohlaydi. */}
                  <span className="sr-only">{t("oldPriceAria")}: </span>
                  <s>{formatPrice(product.oldPrice, locale)}</s>
                </p>
              )}
              <p className="font-display text-lg text-espresso">
                {formatPrice(product.price, locale)}
              </p>
            </div>

            {/* Havola butun kartani qoplaydi — savat tugmasi undan
                yuqorida turishi kerak, aks holda bosilganda sahifa
                almashib ketardi. */}
            <Button
              variant={hydrated && inCart ? "dark" : "gold"}
              size="sm"
              className="relative z-[2]"
              onClick={() => addToCart(product._id)}
            >
              <ShoppingBag size={14} strokeWidth={1.6} aria-hidden="true" />
              {hydrated && inCart ? t("inCart") : t("addToCart")}
            </Button>
          </div>
        </Reveal>
      </motion.article>
      </Reveal>
    </motion.li>
  );
}

/** Yurakcha: bosilganda oltin bilan to'ladi va kichik "burst" beradi. */
/**
 * Rasm ustidagi yumaloq tugma — yurakcha va solishtirish uchun umumiy.
 *
 * Ilgari bu faqat `WishlistButton` edi. Ikkinchi tugma qo'shilganda uni
 * nusxalash o'rniga ikon `children` orqali beriladi: almashinuv
 * animatsiyasi (`AnimatePresence`) ikkalasida ham bir xil bo'lib qoladi.
 */
function RoundButton({
  active,
  label,
  onClick,
  children,
  activeClassName = "",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  /** Ikon — holatga qarab, chunki rang va to'ldirish shunga bog'liq. */
  children: (active: boolean) => React.ReactNode;
  activeClassName?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      whileTap={{ scale: 0.82 }}
      transition={SPRING}
      /*
       * Fon YO KI-YO'QSA tanlanadi, ustiga qo'shilmaydi.
       *
       * Ilgari asosda `bg-warm-white/85` turardi va faol holatda uning
       * USTIGA `bg-gold-deep` qo'shilardi. Ikkala utilita ham bir xil
       * xususiylikda, ya'ni qaysi biri yutishi CSS faylidagi tartibga
       * qolib ketardi — amalda oq fon yutib, ustidagi oq ikon
       * ko'rinmay qolgandi.
       */
      className={[
        "grid size-9 place-items-center rounded-full backdrop-blur-sm transition-colors duration-300",
        active && activeClassName ? activeClassName : "bg-warm-white/85 hover:bg-warm-white",
      ].join(" ")}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={active ? "on" : "off"}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={SPRING}
        >
          {children(active)}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
