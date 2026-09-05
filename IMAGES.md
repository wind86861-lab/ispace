# Rasmlar ro'yxati

`public/images/` dagi barcha fayllar hozircha **o'rindosh** (iliq gradient +
nom yozuvi). Ular real fotolar bilan bir xil o'lchamda, shuning uchun layout
allaqachon yakuniy holatda turibdi.

Real foto kelganda **shu nomdagi faylni almashtiring** — koddagi hech narsa
o'zgarmaydi. O'rindoshlarni qayta yaratish: `npm run build:placeholders`.

Format: `.webp` (yoki `.jpg` — `next/image` ikkalasini ham AVIF/WebP ga
o'giradi). O'lcham jadvaldagidan **kichik bo'lmasin**.

## Hero — `public/images/hero/`

| Fayl | O'lcham | Nima kerak |
|---|---|---|
| `hero-premium.webp` | 1600×1100 | Premium kreslo yorug' interyerda. Chap yarmi bo'sh/tinch bo'lsin — u yerda matn turadi. **LCP rasm** — eng sifatlisi shu bo'lsin. |
| `hero-technology.webp` | 1600×1100 | Kreslo vaznsizlik holatida, texnologiya urg'usi |
| `hero-showroom.webp` | 1600×1100 | Shourum ichki ko'rinishi, bir nechta kreslo |

## Kategoriyalar — `public/images/categories/`

| Fayl | O'lcham | Izoh |
|---|---|---|
| `massage-chairs.webp` | 1200×1400 | **Vertikal** — katta kartani egallaydi |
| `office-chairs.webp` | 900×700 | |
| `treadmills.webp` | 900×700 | |
| `exercise-bikes.webp` | 900×700 | |
| `ellipticals.webp` | 900×700 | |

Pastki qismida to'q gradient bor (matn shu yerda) — kompozitsiyaning muhim
qismi rasmning yuqori 2/3 ida bo'lsin.

## Lead bandi — `public/images/lead/`

| Fayl | O'lcham | Izoh |
|---|---|---|
| `lead-chair.webp` | 2400×1600 | «Не нашли нужный товар?» bandining foni |

Bu rasm bandning emas, **butun ekranning** o'lchamida chiziladi va
scroll'da **mixlanib turadi** (sahifa siljiydi, foto qimirlamaydi) —
shuning uchun u boshqa fotolardan kengroq bo'lishi shart. Chap yarmi
tinch bo'lsin: u yerda forma va matn turadi; kreslo o'ng tomonda.

## Mahsulotlar — `public/images/products/`

Hammasi **900×900, kvadrat, fon tozalangan** (oq yoki shaffof PNG→WebP):

`crown-2` · `takumi` · `sfera` · `runner-x3` · `prestige-pro` · `infinity-a350`

Yangi mahsulot qo'shilsa: faylni shu yerga qo'ying va
`src/content/products.ts` ga yozuv qo'shing.

## Kompaniya — `public/images/about/`

| Fayl | O'lcham | Izoh |
|---|---|---|
| `showroom-1.webp` `showroom-2.webp` `team.webp` `service.webp` | 600×600 | Kvadrat galereya |
| `video-poster.webp` | 1280×720 | Video muqovasi (16:9) |

Video ID: `src/content/about.ts` → `video.youtubeId`. Hozir o'rindosh
qiymat turibdi — **real ID bilan almashtirilishi shart**.

## Blog — `public/images/blog/`

Hammasi **800×500** (8:5): `choose` · `back` · `tech` · `care` · `office` · `showroom`

Sahifa banneri — `blog-banner.webp`, **2400×800** (3:1). U ham ixtiyoriy
va o'rindoshsiz: yuklanmaguncha `/blog` sahifasi bannersiz qoladi.
**Rasm o'rniga video ham yuklash mumkin** (MP4/WebM) — u ovozsiz,
uzluksiz aylanib turadi.

Bo'lim foni — `blog-bg.webp`, **2400×1600**. U ixtiyoriy va o'rindoshi
YO'Q: fayl admin orqali yuklanmaguncha bo'lim tekis krem fonda qoladi.
Yuklangach u lead bandidagidek scroll'da mixlanadi va butun ekranni
egallaydi, ustiga esa och parda tushadi — foto sokin faktura bo'lib
qoladi, chunki uning ustida sarlavha, tablar va kartalar turadi.
Bu uyaga ham rasm o'rniga video yuklash mumkin.

## Hamkorlar — `public/images/partners/`

15 ta **SVG** logo, `currentColor` bilan (monoxrom → hover'da rang).
Agar logo rangli bo'lsa — muammo emas, `grayscale` filtri o'zi qora-oqqa
o'giradi va hover'da rangni qaytaradi.

`fujiiryoki` `inada` `osim` `panasonic` `ogawa` `bodyfriend` `breo` `casada`
`yamaguchi` `tokuyo` `rotai` `titan` `bh` `sole` `matrix`

## Brend

| Fayl | O'lcham | Izoh |
|---|---|---|
| `public/images/og.jpg` | 1200×630 | Ijtimoiy tarmoqlarda ulashilganda ko'rinadi |
| `public/images/logo.png` | 512×512 | JSON-LD `Organization.logo` |
| `public/favicon.svg` | — | Brauzer yorlig'i |

## Alt matnlar

Har rasmning `alt` matni **uch tilda** kontent fayllarida yozilgan
(`src/content/*.ts`). Rasmni almashtirganda alt matni ham mazmunga mos
kelishini tekshiring — u ekran o'quvchilar va SEO uchun ishlatiladi.

---

## Eng oson yo'l: `/admin`

Fayllarni qo'lda almashtirish shart emas. `.env.local` ga `ADMIN_PASSWORD`
yozing, `npm run dev` ni ishga tushiring va **http://localhost:3000/admin**
ni oching — parol so'raydi, keyin quyidagi barcha uyalar ro'yxati chiqadi.
Rasmni tanlaysiz, qolganini sayt o'zi qiladi (kesish, format, o'lcham) va u
darrov saytda ko'rinadi. «Dastlabki rasmni qaytarish» ortga qaytaradi.

Bu yo'l bilan yuklangan rasmlar `public/uploads/` ga tushadi va quyidagi
fayllar o'z joyida qoladi — ya'ni istalgan vaqt asl holatga qaytish mumkin.
