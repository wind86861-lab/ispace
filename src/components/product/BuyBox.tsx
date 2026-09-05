"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Scale, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { useShop } from "@/store/useShop";
import { useUi } from "@/store/useUi";

/**
 * Sotib olish bloki: variantlar, miqdor va savat.
 *
 * Narx variantga qarab qayta hisoblanadi — komplektatsiyaning `extra` si
 * asosiy narxga qo'shiladi. Savatdagi qator hozircha mahsulot bo'yicha
 * saqlanadi (variant emas): `useShop` modeli shunday: `{productId, qty}`.
 * Variantni ham saqlash kerak bo'lsa, o'sha modelni kengaytirish yetarli.
 */
/**
 * Faqat KERAKLI maydonlar.
 *
 * `Product` ni butunlay olib kelish oson yo'l edi, lekin bu client
 * komponent: propi RSC yukiga serializatsiya qilinadi. Butun obyektda
 * `story` bloklarining uch tildagi matnlari, `specs` va `delivery` ham
 * bor — ular bu yerda ishlatilmaydi, lekin har mahsulot sahifasining
 * HTML'iga tushib, uni bekorga og'irlashtirardi.
 */
type BuyBoxProduct = Pick<
  Product,
  | "_id"
  | "price"
  | "oldPrice"
  | "rating"
  | "reviewCount"
  | "inStock"
  | "colors"
  | "bundles"
  | "marketplaces"
>;

export function BuyBox({ product }: { product: BuyBoxProduct }) {
  const t = useTranslations("product");
  const tc = useTranslations("compare");
  const locale = useLocale() as Locale;

  const addToCart = useShop((s) => s.addToCart);
  const toggleCompare = useShop((s) => s.toggleCompare);
  const setQty = useShop((s) => s.setQty);
  const hydrated = useShop((s) => s.hydrated);
  const line = useShop((s) => s.cart.find((l) => l.productId === product._id));
  const inCompare = useShop((s) => s.compare.includes(product._id));
  const openOverlay = useUi((s) => s.open);

  const [color, setColor] = useState(product.colors?.[0]?._id);
  const [bundle, setBundle] = useState(product.bundles?.[0]?._id);
  const [qty, setLocalQty] = useState(1);

  const extra = product.bundles?.find((b) => b._id === bundle)?.extra ?? 0;
  const price = product.price + extra;
  const inStock = product.inStock ?? true;

  const add = () => {
    addToCart(product._id);
    // Miqdor 1 dan katta bo'lsa qatorni darrov to'g'ri songa keltiramiz.
    if (qty > 1) setQty(product._id, (line?.qty ?? 0) + qty);
  };

  return (
    /*
     * Oq karta YO'Q: blok sahifaning o'z krem sirtida turadi.
     *
     * Ilgari u `bg-warm-white` ramkada edi va o'ng ustun sahifadan
     * ajralib, "boshqa varaqqa yopishtirilgan" bo'lib ko'rinardi.
     * Ichki elementlar (rang doiralari, tugmalar, chegaralar) o'zi
     * yetarli ierarxiya beradi.
     */
    <div>
      {/*
        Reyting va sharhlar soni bu yerdan OLIB TASHLANDI: ular
        sotib olish blokining tepasida turib, narxdan diqqatni
        tortardi. Baho `Product.rating` da qolgan — kerak bo'lsa
        boshqa joyda ko'rsatiladi.
      */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        {product.oldPrice && (
          <s className="text-[14px] text-rosewood/85">{formatPrice(product.oldPrice, locale)}</s>
        )}
        <p className="font-display text-[clamp(1.6rem,3vw,2.1rem)] leading-none text-espresso">
          {formatPrice(price, locale)}
        </p>
        <span
          className={[
            "rounded-full px-3 py-1 text-[12px]",
            inStock ? "bg-gold/12 text-gold-ink" : "bg-greige text-espresso-soft",
          ].join(" ")}
        >
          {inStock ? t("inStock") : t("outOfStock")}
        </span>
      </div>

      {product.colors && product.colors.length > 0 && (
        <fieldset className="mt-6">
          <legend className="text-[12px] tracking-[0.14em] text-espresso-soft/85 uppercase">
            {t("colorLabel")}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setColor(c._id)}
                aria-pressed={color === c._id}
                title={pick(c.label, locale)}
                className={[
                  "size-9 rounded-full border-2 transition-colors duration-300",
                  color === c._id ? "border-gold" : "border-taupe/40 hover:border-gold/50",
                ].join(" ")}
                style={{ backgroundColor: c.hex }}
              >
                <span className="sr-only">{pick(c.label, locale)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.bundles && product.bundles.length > 0 && (
        <fieldset className="mt-6">
          <legend className="text-[12px] tracking-[0.14em] text-espresso-soft/85 uppercase">
            {t("bundle")}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.bundles.map((b) => (
              <button
                key={b._id}
                type="button"
                onClick={() => setBundle(b._id)}
                aria-pressed={bundle === b._id}
                className={[
                  "rounded-full border px-4 py-2 text-[14px] transition-colors duration-300",
                  bundle === b._id
                    ? "border-gold/60 bg-gold/12 text-gold-ink"
                    : "border-taupe/40 text-espresso-soft hover:border-gold/50",
                ].join(" ")}
              >
                {pick(b.label, locale)}
                {b.extra ? ` +${formatPrice(b.extra, locale)}` : ""}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/*
        --- miqdor + savat ---

        Qator TO'LIQ kenglikda: miqdor bloki o'z o'lchamida qoladi,
        asosiy tugma esa qolgan joyni oladi. Ilgari `flex-wrap` va
        `sm:flex-none` bilan u mazmuniga qarab qisqarardi va o'ng
        tomonda tartibsiz bo'shliq qolardi.
      */}
      <div className="mt-7 flex items-center gap-3">
        <div className="inline-flex h-13 shrink-0 items-center rounded-full border border-taupe/40 bg-cream">
          <QtyButton label="−" onClick={() => setLocalQty((q) => Math.max(1, q - 1))}>
            <Minus size={15} strokeWidth={1.8} aria-hidden="true" />
          </QtyButton>
          <span aria-live="polite" className="w-10 text-center text-sm tabular-nums text-espresso">
            {qty}
          </span>
          <QtyButton label="+" onClick={() => setLocalQty((q) => Math.min(99, q + 1))}>
            <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          </QtyButton>
        </div>

        {/*
          Sahifaning asosiy harakati — sayt bo'ylab shunday tugmalar
          `Magnetic` bilan kursorga biroz tortiladi. Katalog kartasidagi
          kabi: bir xil vazifadagi element hamma joyda bir xil his bersin.
        */}
        <Magnetic strength={0.2} className="min-w-0 flex-1">
          <Button size="lg" onClick={add} className="w-full">
            <ShoppingBag size={16} strokeWidth={1.6} aria-hidden="true" />
            {hydrated && line ? t("inCart") : t("addToCart")}
          </Button>
        </Magnetic>
      </div>

      {/*
        --- savdo maydonchalari ---
        Ular sotib olishning IKKINCHI yo'li: kimdir Uzum yoki Alifda
        muddatli to'lov bilan olishni afzal ko'radi. Shuning uchun ular
        asosiy tugmaning ZUDLIK BILAN ostida — pastda, xususiyatlardan
        keyin turganda ularni umuman ko'rmasdi.
      */}
      {product.marketplaces && product.marketplaces.length > 0 && (
        <div className="mt-5 border-t border-taupe/30 pt-5">
          <p className="text-[12px] tracking-[0.12em] text-espresso-soft/85 uppercase">
            {t("buyOnMarketplaces")}
          </p>

          {/*
            Plitkalar KENG va teng: ikkitadan qatorda, logotip esa
            markazda. Ilgari ular mazmuniga qarab turli kenglikda
            edi — «Alif Shop» matni tor, logotipli tugma keng — va
            qator tartibsiz ko'rinardi.

            Tashqi havola strelkasi olib tashlandi: u har plitkada
            takrorlanib, logotipdan diqqatni tortardi. Havola ekani
            `target="_blank"` va `aria` matnidan baribir ma'lum.
          */}
          <ul className="mt-3 grid grid-cols-2 gap-2.5">
            {product.marketplaces.map((mp) => (
              <li key={mp._id}>
                <a
                  href={mp.url}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  aria-label={mp.name}
                  /*
                    Na chegara, na fon: logotiplar sahifaning o'z krem
                    sirtida turadi. Ular o'zi rangli va shaklli — oq
                    plitka ularni "yorliq"ka aylantirib, o'ng ustundagi
                    tinch ritmni buzardi.
                    
                    Bosiladigan ekani hover'da bilinadi: yengil oq
                    sirt paydo bo'ladi.
                  */
                  className="flex h-16 items-center justify-center rounded-xl px-4 transition-colors duration-300 hover:bg-warm-white"
                >
                  {mp.image.src ? (
                    <Image
                      src={mp.image.src}
                      alt={mp.name}
                      width={160}
                      height={48}
                      className="max-h-9 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-[14px] font-medium text-espresso">{mp.name}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*
        Ikkilamchi tugmalar TENG ikkita ustunda: ular bir darajadagi
        harakat (sinov va solishtirish), shuning uchun kengligi ham
        bir xil bo'lishi kerak. Ilgari `flex-wrap` da ular matn
        uzunligiga qarab turlicha edi va qator tasodifiy ko'rinardi.
      */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="outline" size="md" onClick={() => openOverlay("consult")}>
          {t("testDrive")}
        </Button>

        {/*
          Solishtirish shu yerda — sotib olish tugmasining yonida, lekin
          `outline` ko'rinishda: bu yordamchi harakat, asosiysi emas.
          Belgilangan holatda tugma oltin bo'lib, matni "solishtirishda"
          ga o'zgaradi — foydalanuvchi ikkinchi marta bosib bekor
          qilishi mumkinligi shundan ko'rinadi.
        */}
        <Button
          variant={hydrated && inCompare ? "gold" : "outline"}
          size="md"
          onClick={() => toggleCompare(product._id)}
          aria-pressed={hydrated && inCompare}
        >
          <Scale size={15} strokeWidth={1.7} aria-hidden="true" />
          {hydrated && inCompare ? tc("inCompare") : tc("add")}
        </Button>
      </div>

    </div>
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
      onClick={onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full text-espresso-soft transition-colors duration-300 hover:text-gold-ink"
    >
      {children}
    </button>
  );
}
