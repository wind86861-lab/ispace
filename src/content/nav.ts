import type { NavItem, SiteContact } from "./types";

export const nav: NavItem[] = [
  { _id: "catalog",  href: "/catalog",    label: { ru: "Каталог",        uz: "Katalog",       en: "Catalog" } },
  { _id: "about",    href: "/about",      label: { ru: "О компании",     uz: "Kompaniya",     en: "About" } },
  { _id: "reviews",  href: "#reviews",    label: { ru: "Отзывы",         uz: "Sharhlar",      en: "Reviews" } },
  { _id: "clients",  href: "#faq",        label: { ru: "Для клиентов",   uz: "Mijozlarga",    en: "For clients" } },
  { _id: "branches", href: "/branches",   label: { ru: "Магазины",       uz: "Do‘konlar",     en: "Stores" } },
  { _id: "blog",     href: "/blog",       label: { ru: "Блог",           uz: "Blog",          en: "Blog" } },
];

export const contact: SiteContact = {
  phone: "+998 (98) 810-10-90",
  phoneHref: "tel:+998988101090",
  email: "info@ispace.uz",
  telegram: "https://t.me/ispace_uz",
  instagram: "https://instagram.com/ispace.uz",
  facebook: "https://facebook.com/ispace.uz",
  youtube: "https://youtube.com/@ispace_uz",
};
