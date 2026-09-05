import type { MetadataRoute } from "next";
import { routing, htmlLang, type Locale } from "@/i18n/routing";
import { products as seedProducts } from "@/content/products";
import { posts as seedPosts } from "@/content/posts";
import { readCollection } from "@/lib/store";
import type { Post, Product } from "@/content/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ispace.uz";

/**
 * Bitta manzil uchun uch tildagi yozuv + o'zaro `hreflang` havolalari.
 *
 * `path` — tildan keyingi qism (`""`, `"/catalog"`, `"/catalog/crown-2"`).
 * Shu yordamchi bo'lgani uchun yangi sahifa qo'shilganda faqat bitta
 * qator yoziladi va hreflang'lar o'z-o'zidan to'g'ri chiqadi.
 */
function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
): MetadataRoute.Sitemap {
  const url = (l: Locale) => `${SITE}/${l}${path}`;

  return routing.locales.map((locale) => ({
    url: url(locale),
    lastModified: new Date(),
    changeFrequency,
    // Asosiy til biroz yuqoriroq — qidiruv tizimi uchun kanonik ishora.
    priority: locale === routing.defaultLocale ? priority : priority - 0.1,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [htmlLang[l], url(l)])),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mahsulotlar admin omboridan kelishi mumkin — ro'yxat runtime'da o'qiladi,
  // shunda yangi qo'shilgani sitemap'ga ham tushadi.
  const [products, posts] = await Promise.all([
    readCollection<Product>("products", seedProducts),
    readCollection<Post>("posts", seedPosts),
  ]);

  return [
    ...entry("", 1, "weekly"),
    ...entry("/about", 0.8, "monthly"),
    ...entry("/branches", 0.8, "monthly"),
    ...entry("/catalog", 0.9, "weekly"),
    ...products.flatMap((p) => entry(`/catalog/${p.slug}`, 0.8, "monthly")),
    ...entry("/blog", 0.9, "weekly"),
    ...posts.flatMap((p) => entry(`/blog/${p.slug}`, 0.7, "monthly")),
  ];
}
