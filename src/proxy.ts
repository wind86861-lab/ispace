import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Til aniqlash va yo'naltirish. Next 16 da bu konvensiya `middleware` emas,
 * `proxy` deb nomlanadi — vazifasi o'sha.
 */
export default createMiddleware(routing);

export const config = {
  // Statik fayllar, _next, API, /admin va nuqtali fayl nomlaridan tashqari
  // hammasi. `/admin` — ichki vosita, u tilga bog'liq emas.
  matcher: "/((?!api|admin|media|_next|_vercel|images|map|.*\\..*).*)",
};
