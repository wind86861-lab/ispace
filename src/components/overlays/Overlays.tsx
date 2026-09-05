"use client";

import type { Product } from "@/content/types";
import { about } from "@/content/about";
import { t as pick } from "@/lib/locale";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import { SearchDrawer } from "./SearchDrawer";
import { ConsultationModal } from "./ConsultationModal";
import { VideoLightbox } from "./VideoLightbox";

/**
 * Barcha qatlamlar bir joyda mount qilinadi, lekin ular `AnimatePresence`
 * ichida — ya'ni yopiq holatda DOM'da hech narsa yo'q va hech qanday
 * fokus tuzog'i faol emas.
 */
export function Overlays({
  products,
  videoFile,
}: {
  products: Product[];
  /**
   * Admin yuklagan video URL'i.
   *
   * Bu propni server komponenti beradi: `Overlays` kontentni statik
   * `about` dan o'qiydi va u yerda yuklamalar KO'RINMAYDI —
   * `applyOverrides` faqat `getContent()` natijasiga qo'llanadi.
   */
  videoFile?: string;
}) {
  const locale = useLocale() as Locale;

  return (
    <>
      <CartDrawer products={products} />
      <WishlistDrawer products={products} />
      <SearchDrawer products={products} />
      <ConsultationModal />
      <VideoLightbox
        youtubeId={about.video.youtubeId}
        title={pick(about.video.title, locale)}
        file={videoFile}
      />
    </>
  );
}
