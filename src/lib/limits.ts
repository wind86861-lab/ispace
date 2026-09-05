/**
 * Kontent chegaralari — HAM server, HAM client uchun.
 *
 * Alohida fayl, chunki `content-validation.ts` `server-only` ga bog'liq
 * va uni admin sahifasidagi client komponentdan import qilib bo'lmaydi.
 * Chegara esa ikkala tomonda ham kerak: interfeys uni oldindan
 * ko'rsatadi, server esa majburlaydi.
 */

/**
 * Bitta mahsulotga biriktirish mumkin bo'lgan nishonlar soni.
 *
 * Kartada nishonlar rasm ustida ustun bo'lib turadi va beshinchisi
 * pastdagi narx blokining ustiga chiqib ketadi.
 */
export const MAX_BADGES = 4;
