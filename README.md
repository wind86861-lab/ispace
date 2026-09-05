# iSpace — bosh sahifa

Premium massaj-oborudovaniye sayti uchun bosh sahifa: 14 bo'lim, uch til
(ru / uz / en), har bo'limda o'z imzo harakati.

## Ishga tushirish

```bash
nvm use            # .nvmrc → Node 22.23.2
npm install
npm run dev        # http://localhost:3000 → /ru
```

Node 22 majburiy (Next 16 talabi). `nvm` bo'lmasa: Node ≥ 22.12 o'rnating.

## Skriptlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Ishlab chiqish serveri |
| `npm run build` / `start` | Production build va server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Playwright smoke testlar (production build'ga qarshi) |
| `npm run build:map` | O'zbekiston xaritasini world-atlas'dan qayta hosil qiladi |
| `npm run build:placeholders` | Rasm o'rindoshlarini qayta chizadi |

## Rasm boshqaruvi — `/admin`

### Ishga tushirish

```bash
cp .env.example .env.local
# .env.local ichiga kuchli parol yozing:
#   ADMIN_USERNAME=admin      (berilmasa — "admin")
#   ADMIN_PASSWORD=1234
#   ADMIN_SESSION_SECRET=<node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
npm run dev
```

So‘ng **http://localhost:3000/admin** — login va parol so‘raydi, keyin
uchta bo‘lim ochiladi: **Mahsulotlar**, **Kategoriyalar** va **Rasmlar**.

| Bo‘lim | Nima qilinadi |
|---|---|
| Maqolalar | Blog maqolalari. Matn **bloklardan** yig‘iladi: xatboshi, sarlavha, ro‘yxat, iqtibos va rasm — bloklarni ko‘chirish va o‘chirish mumkin. |
| Mahsulotlar | Qo‘shish, tahrirlash, o‘chirish. Har bir matn maydoni uchala tilda (ru · uz · en) to‘ldiriladi; to‘ldirilmagan til ilovasida belgi turadi. |
| Kategoriyalar | O‘sha CRUD. Kategoriya `slug` i orqali mahsulotga bog‘lanadi. |
| Rasmlar | Rasm uyalari. Ro‘yxat kontentdan **o‘zi** hosil bo‘ladi — yangi mahsulot qo‘shsangiz, uning uyalari shu yerda paydo bo‘ladi. |

Tahrirlangan kontent `data/content/*.json` da saqlanadi (runtime ma’lumoti,
repoda emas). Fayl bo‘lmasa — `src/content/` dagi statik ro‘yxat ishlatiladi,
ya’ni papkani o‘chirish dastlabki holatga qaytaradi. Yangi mahsulot qayta
build qilmasdan katalogda, o‘z sahifasida va `sitemap.xml` da paydo bo‘ladi. Rasmni tanlaysiz yoki kartaga sudrab tashlaysiz;
u kerakli o‘lchamga kesiladi, sayt kutayotgan formatga o‘giriladi va
saytda **darrov** ko‘rinadi. «Dastlabki rasmni qaytarish» ortga qaytaradi.

### Xavfsizlik

| Qatlam | Nima qiladi |
|---|---|
| **Sukut bo‘yicha yopiq** | `ADMIN_PASSWORD` berilmasa `/admin` ham, API ham **404** — tasodifan ochiq qolishi mumkin emas |
| **Parol** | kamida 8 belgi; `scrypt` bilan hosil qilinadi va `timingSafeEqual` bilan solishtiriladi (javob vaqti parol haqida ma’lumot bermaydi) |
| **Sessiya** | HMAC-SHA256 bilan imzolangan token; `httpOnly` + `SameSite=Strict` cookie; HTTPS da `Secure`; 8 soatda tugaydi |
| **Brute-force** | IP bo‘yicha 5 ta xato urinishdan keyin 15 daqiqa blok (`429`) |
| **CSRF** | mutatsiyalar `X-Requested-With` sarlavhasini talab qiladi (SameSite ustiga qo‘shimcha) |
| **Path traversal** | yozish yo‘li faqat ichki `imageSlots` ro‘yxatidan; mijoz yo‘l bera olmaydi |
| **Fayl mazmuni** | tur va hajm (≤12 MB) tekshiriladi, so‘ng `sharp` qayta kodlaydi — diskka faqat haqiqiy rasm baytlari tushadi |
| **Indekslash** | `robots.txt` da `/admin` va `/api/` taqiqlangan, sahifada `noindex` |

Chiqish tugmasi cookie’ni darhol bekor qiladi. Barcha qatlamlar
`tests/admin.spec.ts` da avtomatik tekshiriladi.

### Rasm qanday saqlanadi

Yuklangan fayl `public/uploads/<slot>.<mazmun-xeshi>.<ext>` sifatida
yoziladi, `data/image-overrides.json` esa asl yo‘lni yangisiga bog‘laydi.

Nega xesh: `next/image` optimizatori natijani **URL bo‘yicha** keshlaydi va
bu kesh xotirada ham turadi — bir xil nom ostida faylni almashtirsangiz,
u eski rasmni qaytaraveradi (`X-Nextjs-Cache: HIT`, ETag o‘zgarmaydi).
Yangi URL esa brauzer, optimizator va CDN keshini o‘z-o‘zidan chetlab
o‘tadi. Yuklashdan keyin `revalidatePath` statik sahifalarni qayta hosil
qiladi, shuning uchun rasm `npm run dev` da ham, `npm start` da ham darrov
ko‘rinadi.

Uyalar ro‘yxati kontent fayllaridan hosil qilinadi — yangi mahsulot yoki
maqola qo‘shsangiz, uning uyasi o‘zidan paydo bo‘ladi.

Rasm o‘lchamlari: [`IMAGES.md`](./IMAGES.md).

## Tuzilish

```
src/
  app/[locale]/     bosh sahifa, layout, xato marshrutlari
  app/admin/        rasm boshqaruvi (parol bilan himoyalangan)
  app/api/admin/    kirish/chiqish va rasm yuklash API'si
  content/          BARCHA kontent — CMS shaklida, 3 tilda
  messages/         UI matnlari (ru/uz/en)
  components/
    sections/       14 bo'lim
    ui/             qayta ishlatiladigan primitivlar
    layout/         header, footer, preloader, suzuvchi tugmalar
    overlays/       savat, saralanganlar, qidiruv, modal
  lib/  hooks/  store/  i18n/
```

## Kontent qanday o'zgartiriladi

Barcha matn, narx, manzil va maqola `src/content/*.ts` da, uch tilda:

```ts
title: { ru: "Массажное кресло", uz: "Massaj kreslosi", en: "Massage chair" }
```

Bo'limlar kontentni **faqat** `getContent()` orqali oladi. CMS (masalan
Sanity) ulanadigan kunda o'sha bitta funksiya so'rovga aylanadi —
komponentlarga tegilmaydi.

UI matnlari (tugma, label, `aria-label`) — `src/messages/{ru,uz,en}.json`.
Uchala faylda kalitlar bir xil bo'lishi shart.

## Harakat qoidalari

- **GSAP** — SplitText (faqat hero sarlavhasi), DrawSVG, counter, hero
  orkestri, xarita. **Motion** — `AnimatePresence`, layout animatsiya,
  hover/tap spring. Bitta elementni ikkalasi bilan animatsiya qilmang.
- Kirish animatsiyalari (`<Reveal>`) — umumiy `IntersectionObserver` +
  CSS transition, ScrollTrigger emas. Ular **har safar** ishlaydi: kirganda
  o'ynaydi, butunlay chiqqanda tiklanadi, qaytganda yana o'ynaydi.
- Kirish va tiklash **turli chegaralarda** (82% / to'liq chiqish). Bitta
  chegara qo'ymang: animatsiya elementni siljitadi va tebranish sikli
  boshlanadi. Shu sababli kartalarda Motion'ning `whileInView` i emas,
  `<Reveal>` ishlatiladi.
- Pointer effektlari (magnetic, tilt, parallaks) faqat
  `(hover: hover) and (pointer: fine)` da mount qilinadi.
- `prefers-reduced-motion` bitta joyda hal qilinadi va **hammasini**
  o'chiradi. Yangi animatsiya qo'shsangiz, shu holatni ham tekshiring.

## Bu bosqichda yo'q

Katalog/mahsulot/blog ichki sahifalari · buyurtma backend'i (forma hozircha
konsolga yozadi) · CMS · autentifikatsiya · deploy.
