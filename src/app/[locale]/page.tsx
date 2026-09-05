import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
import { getContent } from "@/content";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Products } from "@/components/sections/Products";
import { Advantages } from "@/components/sections/Advantages";
import { About } from "@/components/sections/About";

/**
 * §3 — ekran ostidagi og'ir bo'limlar alohida chunk'ga chiqariladi.
 * `ssr` o'chirilmaydi: HTML'da kontent qoladi (SEO va JS'siz o'qish uchun),
 * faqat JS keyinroq yetkaziladi.
 */
const LeadForm = dynamic(() => import("@/components/sections/LeadForm").then((m) => m.LeadForm));
const Partners = dynamic(() => import("@/components/sections/Partners").then((m) => m.Partners));
const Branches = dynamic(() => import("@/components/sections/Branches").then((m) => m.Branches));
const Blog = dynamic(() => import("@/components/sections/Blog").then((m) => m.Blog));
const Reviews = dynamic(() => import("@/components/sections/Reviews").then((m) => m.Reviews));
const Faq = dynamic(() => import("@/components/sections/Faq").then((m) => m.Faq));

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = await getContent();

  return (
    <>
      <Hero slides={content.hero} trust={content.trust} />
      <Categories categories={content.categories} />
      {/*
        «Популярные модели» — admin belgilagan mahsulotlar. Hech biri
        belgilanmagan bo'lsa blok bo'sh qolmasin: tartib bo'yicha
        birinchi oltitasi ko'rsatiladi.
      */}
      <Products
        products={
          content.products.some((p) => p.featured)
            ? content.products.filter((p) => p.featured)
            : [...content.products].sort((a, b) => a.rank - b.rank).slice(0, 6)
        }
        /* Barcha nishonlar; har karta o'zinikini `badgeIds` bo'yicha ajratadi. */
        badges={content.badges}
      />
      <Advantages advantages={content.advantages} />
      <About about={content.about} />
      <LeadForm
        media={content.lead.image}
        contact={content.contact}
        trust={content.leadTrust}
      />
      <Partners partners={content.partners} />
      <Branches branches={content.branches} />
      <Blog posts={content.posts} background={content.blog.background} />
      <Reviews reviews={content.reviews} />
      <Faq faq={content.faq} />
    </>
  );
}
