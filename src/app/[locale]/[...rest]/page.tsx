import { notFound } from "next/navigation";

/**
 * Til prefiksi to'g'ri, lekin qolgan yo'l hech qaysi marshrutga mos
 * kelmaydigan manzillar (`/ru/mavjud-emas`) shu yerga tushadi.
 *
 * Bu **ataylab** kerak. Busiz bunday manzil `[locale]` segmentidan
 * butunlay tashqarida qolardi va Next ildizdagi `app/not-found.tsx` ni
 * chizardi — u yerda esa na til, na layout (header/footer) bor.
 *
 * Endi `notFound()` shu segment ichida chaqiriladi, ya'ni
 * `[locale]/not-found.tsx` ishlaydi: to'g'ri tilda, to'liq dizaynda va
 * javob kodi ham 404 bo'ladi.
 *
 * Aniqroq marshrutlar (`/ru/catalog`, `/ru/catalog/[slug]`) bundan
 * ustun turadi — Next har doim eng aniq moslikni tanlaydi.
 */
export default function LocaleCatchAll(): never {
  notFound();
}
