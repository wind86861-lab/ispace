import type { Locale } from "@/i18n/routing";

/**
 * Son, narx va sana formatlash.
 *
 * BU YERDA `Intl` ISHLATILMAYDI — ataylab.
 *
 * `Intl` natijasi muhitning ICU ma'lumotlariga bog'liq va u serverda
 * (Node) hamda brauzerda BOSHQACHA chiqadi. O'lchangan misol:
 *
 *   uz-UZ, currency UZS
 *     Node   → "1 690 000 soʻm"
 *     Chrome → "UZS 1,690,000"
 *
 * Server bir xil matn chizadi, brauzer boshqasini kutadi — React buni
 * hydration nomuvofiqligi deb biladi (#418), butun daraxtni tashlab
 * yuboradi va SAHIFADAGI HECH BIR EFFEKT ISHLAMAY QOLADI. Amalda bu
 * kirish animatsiyalarini o'ldirdi: kontent `opacity: 0` da qotib
 * qoldi va foydalanuvchi bo'sh bo'limlarni ko'rdi.
 *
 * Shuning uchun qoidalar qo'lda yozilgan: natija har qanday brauzerda,
 * har qanday Node versiyasida BIR XIL.
 */

/** Ming ajratgichi. Rus va o'zbek tilida — uzilmas bo'shliq. */
const GROUP: Record<Locale, string> = { ru: " ", uz: " " };

/** `1690000` → `1 690 000`. */
function group(value: number, locale: Locale): string {
  const digits = Math.round(Math.abs(value)).toString();
  const sign = value < 0 ? "-" : "";
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP[locale]);
}

/**
 * Valyuta yorlig'i tilga bog'liq (§8):
 *   uz → "1 690 000 soʻm"
 *   ru → "1 690 000 сум"
 */
export function formatPrice(value: number, locale: Locale): string {
  return `${group(value, locale)} ${locale === "ru" ? "сум" : "soʻm"}`;
}

/** Counter uchun: `50000` → `50 000`. */
export function formatNumber(value: number, locale: Locale): string {
  return group(value, locale);
}

/**
 * Oy nomi so'z bilan.
 *
 * Ruscha shakl — qaratqich kelishigida ("15 марта"), chunki sana
 * ichida oy shu shaklda keladi.
 */
const MONTHS: Record<Locale, readonly string[]> = {
  ru: [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ],
  uz: [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
  ],
};

/**
 * ISO sanadan o'qilishi mumkin bo'lgan sana.
 *
 * Kun/oy/yil UTC bo'yicha olinadi. Bu ham nomuvofiqlikning oldini
 * oladi: server UTC da, brauzer esa Toshkent vaqtida (UTC+5) turadi
 * va mahalliy `getDate()` yarim tunga yaqin sanalarda BIR KUN farq
 * qilardi.
 */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const day = d.getUTCDate();
  const month = MONTHS[locale][d.getUTCMonth()];
  const year = d.getUTCFullYear();

  if (locale === "uz") return `${day}-${month} ${year}`;
  return `${day} ${month} ${year}`;
}
