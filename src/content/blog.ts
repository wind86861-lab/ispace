import type { BlogSection } from "./types";

/**
 * Bosh sahifadagi blog bo'limining foni.
 *
 * Rasm ATAYLAB ixtiyoriy: fayl yuklanmaguncha bo'lim hozirgidek tekis
 * krem fonda qoladi (`Media.uploaded` — `applyOverrides` qo'yadi). Shu
 * sababli bu yerda o'rindosh fayl ham yaratilmagan: bo'sh gradient
 * fotodan ko'ra tekis fon yaxshiroq.
 *
 * O'lcham lead bandinikidek: fon scroll'da mixlanadi va EKRAN
 * o'lchamida chiziladi, bo'lim o'lchamida emas.
 */
export const blogSection: BlogSection = {
  background: {
    src: "/images/blog/blog-bg.webp",
    width: 2400,
    height: 1600,
    alt: {
      ru: "",
      uz: "",
      en: "",
    },
  },

  /*
   * Banner ham ixtiyoriy va o'rindoshsiz. O'lchami keng va past:
   * u sahifa kengligini egallaydi, balandligi esa sarlavha bilan
   * maqolalar orasidagi masofani yutib yubormasligi kerak.
   */
  banner: {
    src: "/images/blog/blog-banner.webp",
    width: 2400,
    height: 800,
    alt: {
      ru: "Баннер блога iSpace",
      uz: "iSpace blogi banneri",
      en: "iSpace blog banner",
    },
  },
};
