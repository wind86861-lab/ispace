import type { SiteContent } from "./types";
import { applyOverrides, readOverrides } from "@/lib/image-overrides";
import { readCollection } from "@/lib/store";
import { nav, contact as seedContact } from "./nav";
import { hero, trust } from "./hero";
import { categories as seedCategories } from "./categories";
import { products as seedProducts } from "./products";
import { advantages as seedAdvantages } from "./advantages";
import { badges as seedBadges } from "./badges";
import { about } from "./about";
import { partners } from "./partners";
import { branches as seedBranches } from "./branches";
import { posts as seedPosts } from "./posts";
import { blogSection } from "./blog";
import { reviews as seedReviews } from "./reviews";
import { faq as seedFaq } from "./faq";
import { lead } from "./lead";
import { leadTrust as seedLeadTrust } from "./lead-trust";
import { timeline as seedTimeline } from "./timeline";
import { services as seedServices } from "./services";
import { productFeatures as seedFeatures } from "./features";

/**
 * Yagona kontent kirish nuqtasi.
 *
 * Bugun — statik obyekt. CMS ulanadigan kunda **faqat shu funksiya** GROQ
 * so'roviga aylanadi; bo'limlar `SiteContent` tipini ko'rishda davom etadi
 * va bitta ham komponent o'zgarmaydi. Shu sababli u ataylab `async` —
 * chaqiruv joylari allaqachon `await` qilib turadi.
 */
export async function getContent(): Promise<SiteContent> {
  // Admin orqali yuklangan rasmlar asl yo'llarning ustidan yoziladi.
  // Tahrirlanadigan kolleksiyalar esa admin omboridan keladi; ombor
  // bo'sh bo'lsa — shu fayldagi statik ro'yxat ishlatiladi.
  const [
    overrides,
    products,
    categories,
    posts,
    reviews,
    branches,
    faq,
    advantages,
    badges,
    leadTrust,
    timeline,
    services,
    productFeatures,
    contacts,
  ] =
    await Promise.all([
      readOverrides(),
      readCollection("products", seedProducts),
      readCollection("categories", seedCategories),
      readCollection("posts", seedPosts),
      readCollection("reviews", seedReviews),
      readCollection("branches", seedBranches),
      readCollection("faq", seedFaq),
      readCollection("advantages", seedAdvantages),
      readCollection("badges", seedBadges),
      readCollection("leadTrust", seedLeadTrust),
      readCollection("timeline", seedTimeline),
      readCollection("services", seedServices),
      readCollection("productFeatures", seedFeatures),
      readCollection("contact", [seedContact]),
    ]);

  /*
   * Xususiyatlar KATALOGDAN hal qilinadi.
   *
   * Mahsulot faqat `_id` larni saqlaydi; yorliq va ikon bitta joyda
   * turadi. Katalogda yorliq tuzatilsa, u hamma mahsulotda birdaniga
   * yangilanadi — va solishtirish jadvalidagi qatorlar mos tushishda
   * davom etadi.
   *
   * `featureIds` yo'q eski yozuvlarda ichki `features` o'z holicha
   * qoladi: migratsiya talab qilinmaydi.
   */
  /*
   * Kontakt — YAGONA yozuv, lekin ombor massiv bilan ishlaydi.
   * Birinchisi olinadi; ombor bo'sh bo'lsa urug' qiymati qoladi.
   */
  const contact = contacts[0] ?? seedContact;

  const featureById = new Map(productFeatures.map((f) => [f._id, f]));
  const resolved = products.map((p) =>
    p.featureIds
      ? {
          ...p,
          features: p.featureIds
            .map((id) => featureById.get(id))
            .filter((f) => f != null)
            .map((f) => ({ icon: f.icon, label: f.label })),
        }
      : p,
  );

  return applyOverrides<SiteContent>({
    nav,
    hero,
    trust,
    categories,
    products: resolved,
    advantages,
    about,
    partners,
    branches,
    posts,
    blog: blogSection,
    reviews,
    faq,
    badges,
    contact,
    lead,
    leadTrust,
    timeline,
    services,
    productFeatures,
  }, overrides);
}

export type { SiteContent };
