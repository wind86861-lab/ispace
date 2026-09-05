import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
