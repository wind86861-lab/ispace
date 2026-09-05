import type { About } from "./types";

export const about: About = {
  eyebrow: { ru: "О компании", uz: "Kompaniya haqida", en: "About us" },
  title: { ru: "О компании iSpace", uz: "iSpace kompaniyasi haqida", en: "About iSpace" },
  paragraphs: [
    {
      ru: "С 2007 года мы создаём и развиваем решения, которые делают современную жизнь комфортнее.",
      uz: "2007-yildan beri zamonaviy hayotni qulayroq qiladigan yechimlarni yaratamiz va rivojlantiramiz.",
      en: "Since 2007 we have been building solutions that make modern life more comfortable.",
    },
    {
      ru: "Сегодня iSpace — это больше, чем бренд. Это экосистема современных решений для комфорта, здоровья, фитнеса и бизнеса.",
      uz: "Bugun iSpace — brenddan ham kattaroq. Bu qulaylik, salomatlik, fitnes va biznes uchun zamonaviy yechimlar ekotizimi.",
      en: "Today iSpace is more than a brand. It is an ecosystem of modern solutions for comfort, health, fitness and business.",
    },
    {
      ru: "Мы объединяем массажные и офисные кресла, фитнес-оборудование и вендинговые автоматы в едином пространстве iSpace.",
      uz: "Massaj va ofis kreslolari, fitnes uskunalari hamda vending avtomatlarini yagona iSpace maydonida birlashtiramiz.",
      en: "We bring massage and office chairs, fitness equipment and vending machines together in one iSpace.",
    },
  ],
  stats: [
    { _id: "st-year",     value: 2007,  label: { ru: "год основания",      uz: "tashkil topgan yil",  en: "founded" } },
    { _id: "st-clients",  value: 50000, suffix: "+", label: { ru: "довольных клиентов", uz: "mamnun mijozlar", en: "happy clients" } },
    { _id: "st-years",    value: 18,    suffix: "+", label: { ru: "лет на рынке",       uz: "yillik tajriba",  en: "years on the market" } },
    { _id: "st-branches", value: 6,     label: { ru: "шоурума в стране",   uz: "shourum",             en: "showrooms" } },
  ],
  gallery: [
    { src: "/images/about/showroom-1.webp", width: 600, height: 600, alt: { ru: "Шоурум iSpace",        uz: "iSpace shourumi",       en: "iSpace showroom" } },
    { src: "/images/about/showroom-2.webp", width: 600, height: 600, alt: { ru: "Зона массажных кресел", uz: "Massaj kreslolari zonasi", en: "Massage chair area" } },
    { src: "/images/about/team.webp",       width: 600, height: 600, alt: { ru: "Команда iSpace",       uz: "iSpace jamoasi",        en: "The iSpace team" } },
    { src: "/images/about/service.webp",    width: 600, height: 600, alt: { ru: "Сервисная служба",     uz: "Servis xizmati",        en: "Service team" } },
  ],
  certificates: [
    { src: "/images/about/cert-1.webp", width: 600, height: 800,
      alt: { ru: "Сертификат iSpace", uz: "iSpace sertifikati", en: "iSpace certificate" } },
    { src: "/images/about/cert-2.webp", width: 600, height: 800,
      alt: { ru: "Сертификат iSpace", uz: "iSpace sertifikati", en: "iSpace certificate" } },
    { src: "/images/about/cert-3.webp", width: 600, height: 800,
      alt: { ru: "Сертификат iSpace", uz: "iSpace sertifikati", en: "iSpace certificate" } },
    { src: "/images/about/cert-4.webp", width: 600, height: 800,
      alt: { ru: "Сертификат iSpace", uz: "iSpace sertifikati", en: "iSpace certificate" } },
    { src: "/images/about/cert-5.webp", width: 600, height: 800,
      alt: { ru: "Сертификат iSpace", uz: "iSpace sertifikati", en: "iSpace certificate" } },
  ],
  video: {
    // Placeholder — mijozdan real video ID kelganda almashtiriladi.
    youtubeId: "dQw4w9WgXcQ",
    title: { ru: "Экскурсия по шоуруму iSpace", uz: "iSpace shourumi bo‘ylab sayr", en: "A tour of the iSpace showroom" },
    poster: {
      src: "/images/about/video-poster.webp", width: 1280, height: 720,
      alt: { ru: "Кадр из видео о шоуруме iSpace", uz: "iSpace shourumi haqidagi videodan kadr", en: "Still from the iSpace showroom video" },
    },
    /*
     * Ixtiyoriy video fayl. O'rindoshi YO'Q: yuklanmaguncha lightbox
     * yuqoridagi `youtubeId` ni ochadi. Yo'l shu yerda oldindan turadi,
     * chunki admin uyasi shundan hosil bo'ladi.
     */
    file: {
      src: "/videos/about-tour.mp4",
      alt: { ru: "", uz: "", en: "" },
    },
  },
};
