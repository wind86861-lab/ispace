import type { Branch } from "./types";

/**
 * `mapId` — `content/map/uzbekistan.json` dagi `cities` kalitiga aynan mos
 * kelishi shart (skript o'sha kalitlar bo'yicha koordinata hisoblaydi).
 */
export const branches: Branch[] = [
  {
    _id: "br-yunusabad", mapId: "tashkent-yunusabad",
    city:     { ru: "Ташкент", uz: "Toshkent", en: "Tashkent" },
    district: { ru: "Юнусабад", uz: "Yunusobod", en: "Yunusabad" },
    address:  { ru: "Юнусабадский район, ул. Амира Темура, 108", uz: "Yunusobod tumani, Amir Temur ko‘chasi, 108", en: "Yunusabad district, 108 Amir Temur street" },
    phone: "+998 (98) 810-10-90",
    hours: { ru: "Ежедневно 10:00 — 20:00", uz: "Har kuni 10:00 — 20:00", en: "Daily 10:00 — 20:00" },
    mapsUrl: "https://maps.google.com/?q=41.3675,69.2896",
    geo: { lat: 41.3675, lng: 69.2896 },
  },
  {
    _id: "br-chilanzar", mapId: "tashkent-chilanzar",
    city:     { ru: "Ташкент", uz: "Toshkent", en: "Tashkent" },
    district: { ru: "Чиланзар", uz: "Chilonzor", en: "Chilanzar" },
    address:  { ru: "Чиланзарский район, ул. Бунёдкор, 12", uz: "Chilonzor tumani, Bunyodkor ko‘chasi, 12", en: "Chilanzar district, 12 Bunyodkor street" },
    phone: "+998 (98) 810-10-91",
    hours: { ru: "Ежедневно 10:00 — 20:00", uz: "Har kuni 10:00 — 20:00", en: "Daily 10:00 — 20:00" },
    mapsUrl: "https://maps.google.com/?q=41.2756,69.2044",
    geo: { lat: 41.2756, lng: 69.2044 },
  },
  {
    _id: "br-fergana", mapId: "fergana",
    city:     { ru: "Фергана", uz: "Farg‘ona", en: "Fergana" },
    district: { ru: "Ферганская область", uz: "Farg‘ona viloyati", en: "Fergana region" },
    address:  { ru: "г. Фергана, ул. Мустакиллик, 45", uz: "Farg‘ona shahri, Mustaqillik ko‘chasi, 45", en: "Fergana, 45 Mustaqillik street" },
    phone: "+998 (98) 810-10-92",
    hours: { ru: "Ежедневно 10:00 — 19:00", uz: "Har kuni 10:00 — 19:00", en: "Daily 10:00 — 19:00" },
    mapsUrl: "https://maps.google.com/?q=40.3864,71.7864",
    geo: { lat: 40.3864, lng: 71.7864 },
  },
  {
    _id: "br-samarkand", mapId: "samarkand",
    city:     { ru: "Самарканд", uz: "Samarqand", en: "Samarkand" },
    district: { ru: "Самаркандская область", uz: "Samarqand viloyati", en: "Samarkand region" },
    address:  { ru: "г. Самарканд, ул. Рудаки, 21", uz: "Samarqand shahri, Rudakiy ko‘chasi, 21", en: "Samarkand, 21 Rudaki street" },
    phone: "+998 (98) 810-10-93",
    hours: { ru: "Ежедневно 10:00 — 19:00", uz: "Har kuni 10:00 — 19:00", en: "Daily 10:00 — 19:00" },
    mapsUrl: "https://maps.google.com/?q=39.6542,66.9597",
    geo: { lat: 39.6542, lng: 66.9597 },
  },
  {
    _id: "br-denau", mapId: "denau",
    city:     { ru: "Денау", uz: "Denov", en: "Denau" },
    district: { ru: "Сурхандарьинская область", uz: "Surxondaryo viloyati", en: "Surkhandarya region" },
    address:  { ru: "г. Денау, ул. Навои, 7", uz: "Denov shahri, Navoiy ko‘chasi, 7", en: "Denau, 7 Navoi street" },
    phone: "+998 (98) 810-10-94",
    hours: { ru: "Ежедневно 10:00 — 19:00", uz: "Har kuni 10:00 — 19:00", en: "Daily 10:00 — 19:00" },
    mapsUrl: "https://maps.google.com/?q=38.2670,67.8950",
    geo: { lat: 38.267, lng: 67.895 },
  },
  {
    _id: "br-bukhara", mapId: "bukhara",
    city:     { ru: "Бухара", uz: "Buxoro", en: "Bukhara" },
    district: { ru: "Бухарская область", uz: "Buxoro viloyati", en: "Bukhara region" },
    address:  { ru: "г. Бухара, ул. Бахоуддина Накшбанди, 33", uz: "Buxoro shahri, Bahouddin Naqshband ko‘chasi, 33", en: "Bukhara, 33 Bahouddin Naqshband street" },
    phone: "+998 (98) 810-10-95",
    hours: { ru: "Ежедневно 10:00 — 19:00", uz: "Har kuni 10:00 — 19:00", en: "Daily 10:00 — 19:00" },
    mapsUrl: "https://maps.google.com/?q=39.7680,64.4210",
    geo: { lat: 39.768, lng: 64.421 },
  },
];
