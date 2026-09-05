import type { SiteContent } from "./types";
import { applyOverrides, readOverrides } from "@/lib/image-overrides";
import { readCollection } from "@/lib/store";
import { nav, contact } from "./nav";
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
    ]);

  return applyOverrides<SiteContent>({
    nav,
    hero,
    trust,
    categories,
    products,
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
  }, overrides);
}

export type { SiteContent };
