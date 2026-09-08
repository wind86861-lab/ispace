import type { ProductFeature } from "./types";

/**
 * Xususiyatlar katalogi.
 *
 * Bu ro'yxat — DASTLABKI to'plam. Admin uni tahrirlaydi, o'chiradi va
 * yangisini qo'shadi (`data/content/productFeatures.json`). Mahsulot
 * formasida xususiyat qo'lda yozilmaydi, shu ro'yxatdan tanlanadi —
 * shuning uchun solishtirish jadvalidagi qatorlar doim mos tushadi.
 */
export const productFeatures: ProductFeature[] = [
  { _id: "ft-zero-gravity", rank: 1, icon: "zero-gravity", label: { ru: "Невесомость", uz: "Vaznsizlik" } },
  { _id: "ft-body-scan", rank: 2, icon: "body-scan", label: { ru: "Сканирование тела", uz: "Tana skaneri" } },
  { _id: "ft-4d", rank: 3, icon: "4d", label: { ru: "4D-массаж", uz: "4D massaj" } },
  { _id: "ft-sl-track", rank: 4, icon: "sl-track", label: { ru: "SL-направляющая", uz: "SL-yo‘naltirgich" } },
  { _id: "ft-heat", rank: 5, icon: "heat", label: { ru: "Прогрев спины", uz: "Bel isitish" } },
  { _id: "ft-air", rank: 6, icon: "air", label: { ru: "Воздушные подушки", uz: "Havo yostiqchalari" } },
  { _id: "ft-bluetooth", rank: 7, icon: "bluetooth", label: { ru: "Bluetooth", uz: "Bluetooth" } },
  { _id: "ft-folding", rank: 8, icon: "folding", label: { ru: "Складная рама", uz: "Yig‘iladigan rama" } },
  { _id: "ft-quiet", rank: 9, icon: "quiet", label: { ru: "Тихий привод", uz: "Tinch yuritma" } },
];
