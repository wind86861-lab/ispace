import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /*
   * `standalone` — deploy uchun serverga faqat KERAKLI fayllar
   * ko'chiriladi: `.next/standalone` ichida server bundle va
   * `node_modules` ning tanlangan bo'lagi bo'ladi (~200 MB, to'liq
   * `node_modules` esa 930 MB).
   *
   * Nega shu kerak: maqsad server — 1 GB RAM, 1 yadro. U yerda
   * `next build` umuman ishlamaydi (build 1-2 GB talab qiladi) va
   * disk ham yetmaydi. Shuning uchun build LOKALDA bajariladi,
   * serverga esa tayyor natija tashlanadi.
   *
   * `public/` va `.next/static` `server.js` tomonidan avtomatik
   * ko'chirilmaydi — ularni deploy skripti alohida yuboradi
   * (`scripts/deploy.sh`).
   */
  output: "standalone",
  // Loyiha git ildizi tashqarisidagi lock-fayllarni Turbopack o'z ildizi
  // deb o'ylab qolmasligi uchun ildizni aniq ko'rsatamiz.
  turbopack: { root: path.resolve(process.cwd()) },
  // Dev serverga 127.0.0.1 yoki lokal tarmoq IP'si orqali kirilganda
  // HMR bloklanib, sahifa hydration'i to'xtab qolmasligi uchun.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // AVIF birinchi — sezilarli kichikroq, keyin WebP zaxira sifatida.
    formats: ["image/avif", "image/webp"],
    /*
     * Next 16 da bu ro'yxat MAJBURIY va sukut qiymati `[75]`.
     * Ro'yxatda bo'lmagan qiymat eng yaqiniga tushiriladi, ya'ni
     * `quality={90}` jimgina 75 bo'lib qolardi.
     */
    qualities: [75, 90],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
    /*
     * Ishlab chiqishda kesh qisqa: /admin orqali rasm almashtirilganda
     * optimizator eski nusxani qaytarib qo'ymasin. Production'da esa
     * uzoq kesh — rasm nomi o'zgarmaguncha qayta ishlanmaydi.
     */
    minimumCacheTTL: process.env.NODE_ENV === "production" ? 60 * 60 * 24 * 365 : 1,
  },
  experimental: {
    // GSAP/motion/lucide dan faqat ishlatilgani bundle'ga tushsin (§3 byudjeti).
    optimizePackageImports: ["lucide-react", "motion"],
  },
};

export default withNextIntl(nextConfig);
