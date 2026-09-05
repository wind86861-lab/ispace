import type { Metadata } from "next";
import { routing, htmlLang } from "@/i18n/routing";
import "./globals.css";

/**
 * Til prefiksisiz va hech qaysi marshrutga mos kelmagan manzillar.
 *
 * Ilgari bu yerda `redirect("/ru/404")` turardi — lekin `/ru/404` degan
 * marshrut umuman yo'q edi, shuning uchun u ham shu faylga qaytib
 * kelardi va **cheksiz redirect sikli** hosil bo'lardi
 * (`ERR_TOO_MANY_REDIRECTS`). Shu sababli bu yerda hech qayerga
 * yo'naltirilmaydi — sahifa shu yerning o'zida chiziladi.
 *
 * Ildiz layout bo'sh (`<html>` ni `[locale]/layout.tsx` chizadi), shuning
 * uchun bu sahifa TO'LIQ hujjatni o'zi qaytarishi kerak. U ataylab
 * yengil: shrift yuklanmaydi, JS yo'q — 404 sahifasi uchun eng arzon yo'l.
 *
 * Amalda foydalanuvchi bu sahifani kamdan-kam ko'radi: til prefiksi bor
 * manzillar `[locale]/[...rest]` orqali to'liq dizayndagi 404 ga tushadi.
 */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  return (
    <html lang={htmlLang[routing.defaultLocale]}>
      <body className="bg-cream text-espresso-soft antialiased">
        <main className="container-lux flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-6xl text-gold">404</p>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-espresso">
            Страница не найдена
          </h1>
          <p className="measure text-sm leading-relaxed">
            Возможно, ссылка устарела или в адресе опечатка.
          </p>

          {/* Uchala til ham berilgan: bu sahifa qaysi tilda ochilganini
              bilmaydi, shuning uchun tanlovni foydalanuvchiga qoldiramiz. */}
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {routing.locales.map((l) => (
              <li key={l}>
                <a
                  href={`/${l}`}
                  className="inline-flex h-11 items-center rounded-full border border-taupe/60 px-6 text-sm text-espresso transition-colors duration-300 hover:border-gold hover:text-gold-ink"
                >
                  {l.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
