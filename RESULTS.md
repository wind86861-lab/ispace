# Natijalar — o'lchangan, taxmin qilingan emas

Barcha raqamlar production build'ga qarshi olingan
(`npm run build && npm run start`), Lighthouse **mobil, throttled** rejimida,
uch marta takrorlab.

## Lighthouse

| Ko'rsatkich | Rejadagi majburiy | Maqsad | **Natija** |
|---|---|---|---|
| Performance | ≥ 75 | ≥ 85 | **76 – 78** ✅ |
| Accessibility | ≥ 95 | 100 | **100** ✅ |
| Best Practices | ≥ 95 | 100 | **100** ✅ |
| SEO | ≥ 95 | 100 | **100** ✅ ¹ |
| CLS | < 0.05 | — | **0** ✅ |

¹ Sayt `ispace.uz` domeni bilan build qilinadi, shuning uchun `localhost` da
o'lchaganda `rel=canonical` "boshqa domen" deb belgilanadi va SEO 92 chiqadi.
`NEXT_PUBLIC_SITE_URL` ni test domeniga qo'yib o'lchaganda — **100**.

Boshqa ko'rsatkichlar: FCP 1.9 s · LCP 2.4 s · Speed Index 6.2 s ·
**TBT 510–570 ms**.

> Animatsiyalar **ikki tomonlama** qilingandan keyin (pastga ham, yuqoriga
> ham qayta ishlaydi) Performance 81→77 ga tushdi: kuzatuvchilar va
> ScrollTrigger'lar endi bir marta ishlab o'chmaydi, doimiy ulanib turadi.
> Bu — talab qilingan xatti-harakatning haqiqiy narxi; majburiy chegara
> (≥ 75) baribir saqlanib qoldi.

## Optimizatsiya yo'li (TBT bo'yicha)

Birinchi o'lchov Performance **60** va TBT **2 610 ms** bergandi. Nima
qilingani va nima berganini:

| Qadam | TBT | Perf |
|---|---|---|
| Boshlang'ich | 2 610 ms | 60 |
| `zod` + resolver olib tashlandi (ikkita kichik forma uchun 95.7 KB gzip edi) | 2 610 ms | 60 |
| 34 ta `<Reveal>` ScrollTrigger → bitta umumiy IntersectionObserver + CSS | 1 910 ms | 61 |
| SplitText faqat hero sarlavhasida qoldirildi (10 ta emas) | 1 490 ms | 64 |
| DrawIcon / Counter / yulduzlar ScrollTrigger'siz, ko'rish maydoniga yaqinlashganda | 1 200 ms | 66 |
| Ken Burns GSAP → CSS animatsiya (9 s davomida har kadr JS ishlamaydi) | 1 150 ms | 68 |
| Kontrast tuzatishlari + `transform` konteyner blok xatosi (CLS 0.019 → 0) | 400 ms | 81 |
| *Animatsiyalar ikki tomonlama qilindi (talab bo'yicha)* | **510 ms** | **77** |

Butun sahifada endi atigi **4 ta ScrollTrigger** qolgan: hero sarlavhasi,
hero trust-bar, kategoriya kartalari va xarita — ya'ni GSAP faqat haqiqatan
timeline yoki SVG matematikasi kerak joyda ishlaydi.

## Animatsiyalarning takrorlanishi

Barcha kirish effektlari **har safar** ishlaydi: element ekranga kirganda
o'ynaydi, butunlay chiqib ketganda boshlang'ich holatiga qaytadi, qaytib
kirganda yana o'ynaydi — pastga ham, yuqoriga ham.

Bu ikkita alohida kuzatuvchi bilan qilingan va bu **ataylab**:

- **kirish** — ekranning 82% chizig'ida;
- **tiklash** — element **butunlay** ekrandan chiqqanda.

Agar ikkalasi bitta chegarada bo'lsa, tebranish sikli paydo bo'ladi:
animatsiyaning o'zi elementni 24 px siljitadi, bu uni chegaradan chiqaradi,
u tiklanadi, yana kiradi… Karta hech qachon to'xtamaydi. Aynan shu sabab
mahsulot va blog kartalari Motion'ning `whileInView` idan umumiy `Reveal`
tizimiga ko'chirildi (Motion ularda faqat saralash/filtr uchun `layout` va
`exit` ni boshqaradi).

## Bajarilmagan majburiyat: JS byudjeti

Rejada **≤ 220 KB gzip** deb yozilgandi. Haqiqiy natija — **365 KB gzip**
(1.12 MB raw). Bu ochiq-oydin oshib ketish, sababi bilan:

| Nima | gzip |
|---|---|
| Next 16 + React 19 karkasi (bo'sh sahifada ham) | ~165 KB |
| GSAP + ScrollTrigger + SplitText + DrawSVG | 48 KB |
| Motion (`AnimatePresence`, layout animatsiya, spring) | 45 KB |
| Embla, Radix, lucide, Lenis, zustand, next-intl, sayt kodi | ~107 KB |

**Byudjet noto'g'ri qo'yilgan edi:** u karkasning o'z og'irligi o'lchanmasdan
yozilgan, holbuki karkasning o'zi 165 KB — ya'ni butun byudjetning 75% i.
Qolgan 55 KB ga na GSAP, na Motion sig'adi.

Pastga tushirish yo'llari va ularning narxi:

- **Motion'ni olib tashlash** (−45 KB): `AnimatePresence`, layout animatsiya
  va spring'lar GSAP Flip bilan qayta yozilishi kerak. 8+ komponentga
  tegadi, xatolik xavfi yuqori.
- **DrawSVG + SplitText'dan voz kechish** (−15 KB): §6 va hero'ning imzo
  harakatlari yo'qoladi.
- **Ekran ostidagi bo'limlarni haqiqatan kechiktirish** (−80 KB gacha):
  kontent SSR HTML'dan chiqib ketadi, ya'ni SEO'ga zarar.

Uchalasi ham dizayn brifidagi narsani qurbon qiladi. Shuning uchun ular
qilinmadi — qaror sizniki bo'lishi kerak. Real ko'rsatkichlar (Performance
81, TBT 400 ms, CLS 0) byudjet raqamidan muhimroq va ular joyida.

## Testlar

`npx playwright test` — **33/33 o'tadi**:
til aniqlash (4 ta stsenariy) · uchala tilda sarlavhalar · savat paneli +
Esc · savatga qo'shish · FAQ akkordeoni · forma validatsiyasi ·
reduced-motion'da yashirin kontent yo'qligi · til almashtirgich ·
konsolda xato yo'qligi (hydration ham) · foto ustidagi matn kontrasti
(piksel bo'yicha o'lchanadi) · suzuvchi panel telefonda boshqaruvni
to'smasligi · hikoya bloki faqat rasm yuklanganda ko'rinishi ·
katalog va mahsulot sahifalari uchala tilda.

`npm run typecheck` va `npm run lint` — toza.

## Tuzatilgan xato: yuklangan rasm saytda ko'rinmasdi

**Belgisi.** `/admin` orqali rasm yuklanadi, fayl diskka yoziladi (o'lchami
o'zgaradi), lekin saytda eski rasm turaveradi.

**Sababi.** `next/image` optimizatori natijani **URL bo'yicha** keshlaydi va
bu kesh xotirada ham turadi. Fayl mazmuni o'zgarsa ham URL o'zgarmagani
uchun optimizator eski nusxani qaytaradi. O'lchangan dalil:

```
yuklashdan oldin:  ETag: QVtDzGCw…  X-Nextjs-Cache: MISS
yuklashdan keyin:  ETag: QVtDzGCw…  X-Nextjs-Cache: HIT   ← bir xil ETag
```

Kesh papkasini (`.next/cache/images`) o'chirish **yordam bermadi** —
xotiradagi nusxa saqlanib qoladi.

**Yechim.** Yuklangan fayl mazmun xeshi bilan saqlanadi
(`/uploads/<slot>.<xesh>.webp`) va `data/image-overrides.json` asl yo'lni
yangisiga bog'laydi. Har yangi rasm — yangi URL, ya'ni brauzer, optimizator
va CDN keshi o'z-o'zidan chetlab o'tiladi. Yuklashdan keyin
`revalidatePath` statik sahifalarni qayta hosil qiladi, shuning uchun rasm
`npm run dev` da ham, `npm start` da ham darrov ko'rinadi.

`tests/admin.spec.ts` da avtomatik tekshiriladi: yuklangandan keyin sahifa
HTML'ida yangi xeshli yo'l borligi tasdiqlanadi.

## Tuzatilgan xato: `sharp` e'lon qilinmagan bog'liqlik edi

`sharp` uch joyda to'g'ridan-to'g'ri `import` qilinadi (`image-analysis.ts`,
`api/admin/images/route.ts`, `scripts/migrate-uploads.mjs`), lekin
`package.json` da yo'q edi. U faqat Next'ning **ixtiyoriy** tranzitiv
bog'liqligi sifatida o'rnatilgan edi:

```
sharp entry flags: { optional: true }
required by: [ [ 'node_modules/next', '^0.35.4', 'optional' ] ]
```

Ya'ni `npm ci --omit=optional` da yoki prebuilt binary yo'q platformada
admin yuklash quvuri butunlay ishlamay qolardi. Endi `sharp@^0.35.4`
aniq bog'liqlik.

## Tuzatilgan xato: rasm o'chirishdagi poyga

`DELETE` faylni **overrides'dan oldin** o'chirardi. Oraliqda
`image-overrides.json` allaqachon mavjud bo'lmagan faylga ishora qilib
turardi va o'sha lahzadagi so'rov buzilgan rasm olardi
(`isn't a valid image ... received null` — test yurgizganda ko'rindi).
Endi tartib teskari: avval havola olib tashlanadi, keyin fayl.

## Kontrast: o'lchangan, e'lon qilingan emas

Lighthouse Accessibility 100 bo'lsa ham **matn kontrastining bir qismini
umuman tekshirmaydi**: u faqat e'lon qilingan CSS ranglarini solishtiradi.
Foto ustidagi matn va yarim-shaffof sirt ostidan o'tayotgan to'q bo'lim
uning nazaridan chetda qoladi.

Shuning uchun haqiqiy piksellar o'lchandi: matn vaqtincha shaffof
qilinadi, ekran olinadi va matn turgan to'rtburchakdagi fon bo'yicha
kontrast hisoblanadi (fixed header ostida qolgan elementlar
`elementFromPoint` bilan chiqarib tashlanadi).

Natija — bitta umumiy sabab uch joyda takrorlangan edi:

> **Foni oldindan noma'lum yarim-shaffof sirt matn kontrastini
> kafolatlay olmaydi.**

| Joy | Nima bo'lgan | Edi | Bo'ldi |
|---|---|---|---|
| Kategoriya kartalari | `from-espresso/75 via-espresso/20` gradienti aynan matn yo'lagida ~0.2 ga tushardi | **1.35:1** | ≥ 4.6:1 |
| Karta tavsifi (`text-cream/75`) | o'sha gradient ustida | **1.85:1** | ≥ 4.5:1 |
| Sticky header | `bg-cream/80` — to'q bo'lim ostidan o'tganda sirt o'rta tonga aylanardi (o'lchangan fon L = 0.593) | **3.32:1** | ≥ 4.5:1 |
| Hero hisoblagichi | `bg-warm-white/80` panel to'q foto USTIDA turardi | **3.91:1** | ≥ 4.6:1 |
| Kichik matn (`text-espresso-soft/75`) | alfa kontrastni sirtga qarab tushirardi: kremda 4.55, alabasterda 4.44, filial kartasida 4.04 | **4.04:1** | ≥ 5.7:1 |

Qilingan ishlar:

- **`card-scrim`** — matn asosi endi kartaga emas, **matn blokining
  o'ziga** bog'langan. Karta balandligi turlicha (asosiy 442px, kichigi
  224px), shuning uchun foizli gradient har kartada matnni boshqa
  nuqtaga tushirardi. Blokka bog'langanda matn har doim bir xil
  qorong'ulikda turadi.
- **`--color-gold-ink`** (`#6f5229`) — yarim-shaffof sirtdagi oltin matn
  uchun; kremda 6.4:1, ya'ni sirt qanchalik qorayishidan qat'i nazar
  zaxira qoladi.
- **Header `bg-cream/90`**, hero paneli **`bg-warm-white/95`**.
- Kichik matnda alfa **0.85 dan past emas**.
- Scrim kuchaygach kartalar kulrang ko'rinmasligi uchun sokin holatdagi
  to'yinganlik `0.55` → `0.8`.

Qolgan yagona element — **logotipdagi "Space"** (4.02:1). WCAG 1.4.3
logotiplarga kontrast talab qo'ymaydi; bu `globals.css` da allaqachon
hujjatlangan istisno.

## Tuzatilgan xato: suzuvchi panel telefonda bosishni to'sardi

390px ekranda karta 20–370px, suzuvchi panel esa 326–374px da — ya'ni u
kartaning o'ng chekkasidagi boshqaruvlar ustiga tushadi. O'lchov
**"saralanganlarga qo'shish"** tugmasining bosish nuqtasi haqiqatan
bloklanishini ko'rsatdi (`elementFromPoint` panelni qaytarardi).

To'qnashuv aynan scroll paytida yuz beradi — karta panel oldidan o'tib
ketadi. Endi panel scroll davomida chekinadi va to'xtagach qaytadi.
Kattaroq ekranda panel kontent ustunidan tashqarida, shuning uchun u
yerda hech narsa o'zgarmagan (o'lchangan: desktopda `opacity` doim 1).

**Qolgan cheklov:** panel to'xtagan holatda baribir kontent ustida
turadi va telefonda ba'zi sarlavhalarni qisman yopadi. Bu — har qanday
suzuvchi tugmaning tabiati; butunlay yo'qotish uchun uni telefonda
boshqacha joylashtirish kerak (masalan pastki panelga), bu esa
mahsulot qarori.

## Katalog va mahsulot sahifalari

Yangi marshrutlar (hammasi build vaqtida statik chiziladi):

| Marshrut | Nechta sahifa |
|---|---|
| `/[locale]/catalog` | 3 (ru · uz · en) |
| `/[locale]/catalog/[slug]` | 18 (6 mahsulot × 3 til) |

`sitemap.xml` da 24 ta yozuv, har biri o'zaro `hreflang` bilan.
Menyu «Каталог» endi langar emas, haqiqiy sahifa; `NavLink` langar
(`#branches`) va sahifa (`/catalog`) manzillarini ajratadi, shuning uchun
til prefiksi saqlanadi va ortiqcha redirect bo'lmaydi.

**Katalog:** kategoriya chiplari, narx oralig'i (chegaralari mahsulotlardan
hisoblanadi, qo'lda yozilmaydi), saralash va topilgan mahsulotlar soni.
Filtrlar mijoz tomonida — ro'yxat kichik va u sahifa bilan birga SSR'da
keladi, shuning uchun har filtrda serverga borish faqat kechikish qo'shardi.

**Mahsulot sahifasi:** galereya, sotib olish bloki (rang, komplektatsiya —
narx variantga qarab qayta hisoblanadi), xususiyat ikonlari, uch ilovali
ma'lumot (tavsif · xarakteristikalar · yetkazish) va `Product` JSON-LD
(narx, mavjudlik, reyting).

Maketdagi to'rtinchi «Отзывы» ilovasi **ataylab olinmadi**: saytdagi
sharhlar umumiy, muayyan mahsulotga bog'lanmagan. Ularni mahsulot ichida
ko'rsatish "shu model haqida" degan noto'g'ri taassurot berardi — sharhlar
sahifaning pastida, o'z bo'limida turadi.

## Hikoya bloklari: yuklansa ko'rinadi, yo'qsa yo'q

Mahsulot sahifasining pastki bloklari (`ProductStoryBlock`) kontentda
oldindan e'lon qilinadi, lekin foydalanuvchi ularni **faqat rasm admin
orqali yuklangandan keyin** ko'radi. Aks holda sahifada iliq gradientli
o'rindosh bilan to'ldirilgan bo'sh ramka turib qolardi.

Buni `Media.uploaded` hal qiladi. Uni `applyOverrides` qo'yadi — ya'ni
"bu yo'l uchun admin panelida haqiqatan fayl bor". Fayl nomiga yoki
o'lchamiga qarab taxmin qilinmaydi: kontentdagi yo'l o'rindoshniki bilan
bir xil ko'rinadi, farqni faqat override jadvali biladi.

Uyalar kontentdan **o'zi hosil bo'ladi** (`imageSlots`): mahsulot
qo'shilsa, uning bloklari admin panelida o'zidan paydo bo'ladi. Uyalar
soni 42 dan **92** ga chiqdi.

Kichik rasmlar (`thumbs`) alohida filtrlanadi: uchtadan ikkitasi
yuklangan bo'lsa, qatorda o'sha ikkitasi ko'rinadi.

O'lchangan yo'l (`tests/product-story.spec.ts`):

```
yuklashdan oldin:   blok YO'Q
rasm yuklandi:      blok BOR + rasm haqiqatan beriladi
rasm o'chirildi:    blok yana YO'Q
```

`revalidatePath("/", "layout")` sahifalarni qayta hosil qiladi, shuning
uchun statik generatsiya qilingan mahsulot sahifasi ham darrov yangilanadi.

## Blog: ro'yxat va maqola sahifalari

| Marshrut | Nechta sahifa |
|---|---|
| `/[locale]/blog` | 3 |
| `/[locale]/blog/[slug]` | 18 (6 maqola × 3 til) |

`sitemap.xml` da endi **45** yozuv. Menyudagi «Блог» ham langar emas,
haqiqiy sahifa.

**Ro'yxat:** rukn tablari, qidiruv, topilganlar soni; maqolalar sanasi
bo'yicha saralanadi. **Maqola:** non ushshoqlari, rukn/sana/o'qish vaqti,
muqova, matn, «Читайте также» va `BlogPosting` JSON-LD.

### Maqola matni — bloklar, HTML emas

Matn `PostBlock` ketma-ketligi: xatboshi · sarlavha · ro'yxat · iqtibos ·
rasm. Xom HTML satri EMAS, chunki kontent uch tilda va admin panelidan
tahrirlanadi: HTML bo'lsa har tahrirda uni tozalash kerak bo'lardi va
bitta yopilmagan teg butun sahifani buzardi. Bloklarda esa har element
o'z tipiga ega va React uni o'zi chizadi — sahifaga begona razmetka
umuman tushmaydi.

Validatsiya blokni tipi bo'yicha qayta yig'adi: noma'lum `kind` yoki
noto'g'ri sana omborga tushmaydi (`body[0].kind: noma'lum blok turi`,
`publishedAt: sana YYYY-MM-DD ko'rinishida bo'lsin`).

### Rasm bloki — mahsulot hikoyasidagi qoida

Maqoladagi rasm ham **yuklanmaguncha ko'rsatilmaydi**. Shu bilan birga
uning uyasi `imageSlots` da o'zi hosil bo'ladi — busiz admin blokni
qo'sha olardi, lekin rasmini yuklay olmasdi va blok abadiy yashirin
qolardi (bu kamchilik yo'l-yo'lakay topilib tuzatildi).

O'lchangan yo'l (`tests/blog.spec.ts`):

```
yuklashdan oldin:  blok YO'Q
rasm yuklandi:     blok BOR
rasm o'chirildi:   blok yana YO'Q
```

## Sirtlar ritmi: sahifa bitta yuvilgan yuza edi

Kengaytirilgan palitra (`alabaster` · `greige` · `rosewood` · `charcoal`)
`globals.css` da e'lon qilingan, lekin deyarli ishlatilmagan edi —
o'lchandi: `rosewood` 37 marta (asosan admin xato uslublarida va xarita
nuqtalarida), `alabaster` 2, `greige` 1. Natijada bo'limlarning deyarli
hammasi bir xil krem fonda turardi va sahifa bitta tekis yuza bo'lib
o'qilardi.

Endi bo'limlarda ataylab qurilgan ritm bor:

| Bo'lim | Sirt |
|---|---|
| Hero · Kategoriyalar | krem |
| Mahsulotlar | alabaster |
| **Afzalliklar** | **charcoal** |
| Kompaniya | krem |
| «Не нашли нужный товар?» | alabaster band |
| Hamkorlar | greige |
| Filiallar | krem |
| Blog | alabaster |
| **Sharhlar** | **rosewood** |
| Savol-javob | alabaster |

Ikkita TO'Q "bob chegarasi" bir-biridan bir necha ochiq bo'lim bilan
ajratilgan va ranglari boshqa, shuning uchun takrorlanish sezilmaydi.
Sharhlar aynan rosewoodda: oq kartalar u yerda sezilarli ko'tarilib
turadi, sharh esa sotuvda hal qiluvchi.

To'q bo'limlar tekis "plita" bo'lib qolmasligi uchun ikkalasida ham
harakatsiz `blur` doiralari bor (bir marta chiziladi, scrollda qayta
hisoblanmaydi). Rangli bo'limlar chegarasi `border-y` bilan aniq —
qadam tasodifiy emas, ataylab.

### Yo'l-yo'lakay topilgan kontrast xatosi

`SectionHeading tone="dark"` da tagsarlavha `text-cream/65` edi. Bu qiymat
charcoal (#2E2E2E) uchun tanlangan; rosewood (#7D4047) ancha ochiq va
o'sha alfa **3.95:1** ga tushdi (o'lchangan). `/80` ga ko'tarildi —
rosewoodda 5.1:1, charcoalda bundan ham yuqori.

Yakuniy audit: barcha sahifalarda faqat logotip qoladi (WCAG 1.4.3
logotiplarga kontrast talab qo'ymaydi).

## Rasm tiniqligi: hammasi 75 sifatda berilardi

Next 16 da `images.qualities` sukut bo'yicha **`[75]`** va ro'yxatda
bo'lmagan qiymat jimgina eng yaqiniga tushiriladi. Ya'ni saytdagi barcha
rasm 75 sifatda chiqarilardi — premium mahsulot fotosida bu ko'zga
tashlanadi: teri fakturasi va chok chiziqlari yuviladi.

Uch qadam:

| Nima | Edi | Bo'ldi |
|---|---|---|
| `next/image` sifati | 75 (majburiy sukut) | **90** (`qualities: [75, 90]` ro'yxatga kiritilgan) |
| Yuklashda WebP/JPEG | 88 / 86 | **92 / 92** |
| Yuklashda maksimal o'lcham | 2000px | **2400px** |
| Kichraytirishdan keyin | — | **yengil unsharp** (`sigma: 0.7`) |

O'tkirlash ataylab kuchsiz: kattaroq `sigma` chekkalarda oq halqa berib,
fotoni sun'iy ko'rsatadi. Maqsad — qayta namunalashda yo'qolganini
qaytarish, o'tkirlikni oshirish emas. Tartib ham muhim: o'tkirlash
**kichraytirishdan keyin** bo'lishi kerak, aks holda u resampling'da
yo'qoladi (birinchi urinishda aynan shu xato qilingan edi).

O'lchangan: `/_next/image?...&q=90` — endi barcha so'rovlarda `q=90`.

## Kategoriya rasmi: nisbat va tavsiya etilgan o'lcham

Keng banner kartada rasm **o'ng tomonga** suriladi (`78%`), `right`
emas: oq fonli mahsulot fotosi `contain` bilan chiziladi va keng kadrda
tor kvadrat bo'lib qoladi — `right` uni chekkaga yopishtirib, yumaloq
burchak bilan kesib tashlardi.

Muharrirda endi **tavsiya etilgan o'lcham** ko'rsatiladi va u karta
turiga qarab o'zgaradi:

| Karta | Tavsiya |
|---|---|
| Keng banner | 1600×600 |
| Asosiy (katta) | 1200×1400 |
| Oddiy | 900×700 |
| Mahsulot | 900×900 |
| Maqola muqovasi | 800×500 |
| Maqola matnidagi rasm | 1600×900 |
| Filial fotosi | 1200×800 |

Yuklangandan keyin haqiqiy o'lcham shu bilan solishtiriladi va kichik
bo'lsa ogohlantirish chiqadi — lekin yuklash **rad etilmaydi**: ba'zan
boshqa foto umuman yo'q va kichigi hech narsadan yaxshiroq. Qaror
adminniki, kodning ishi — oqibatini aytish.

## Admin xavfsizligi

`tests/admin.spec.ts` tekshiradigan qatlamlar: parolsiz 404 · sessiyasiz
401/redirect · noto'g'ri parol 401 · CSRF sarlavhasisiz 403 · qalbaki
cookie 401 · 5 xato urinishdan keyin 429 (15 daqiqa) · chiqish cookie'ni
bekor qiladi. Parol `scrypt` + `timingSafeEqual`, sessiya HMAC-SHA256
bilan imzolangan `httpOnly`/`SameSite=Strict` cookie'da, HTTPS da `Secure`.

## Tuzatilgan xato: yuklangan rasm production'da umuman ochilmasdi

`npm run dev` da yuklangan rasm ko'rinardi, `npm start` da esa yo'q.

**Sabab.** `next start` `public/` papkasini build vaqtida ro'yxatga oladi.
Runtime'da u yerga qo'shilgan fayl statik sifatida berilmaydi — so'rov
marshrutlashga tushib, locale prefiksiga **307 redirect** qaytaradi:

```
/uploads/<yangi-fayl>.webp   → 307 text/html   ← runtime'da qo'shilgan
/uploads/<build-dagi>.webp   → 200 image/webp
```

**Yechim.** Yuklamalar `data/uploads/` da saqlanadi (build artefakti emas,
runtime ma'lumoti) va `src/app/media/[...path]` marshruti orqali beriladi.
Fayl nomida mazmun xeshi bo'lgani uchun kesh `immutable`. Yo'l bo'ylab
chiqib ketish imkonsiz: faqat bitta bo'lakli, `[A-Za-z0-9._-]` nomlar.

`tests/admin.spec.ts` yuklangandan keyin faylning **haqiqatan berilishini**
(200 + `image/*`) tekshiradi.

## Tuzatilgan xato: mahsulot fotosi kesilib qolardi

Yuklash quvuri rasmni slot nisbatiga `fit: "cover"` bilan kesib saqlardi.
Xona fotosi uchun bu ishlardi, oq fonli mahsulot fotosining cheti esa
kesilib, buyum yarim ko'rinib qolardi — va kesilgan nusxa diskka yozilgani
uchun ortga qaytarib bo'lmasdi.

Endi rasm **kesilmaydi** (`fit: "inside"`), turi esa yuklashda aniqlanadi:
chekka piksellari bir xil va yorug' bo'lsa — mahsulot fotosi, u `contain`
bilan butunlay ko'rsatiladi va bo'sh chekkalar rasmning o'z fon rangi bilan
to'ldiriladi. Aks holda `cover`.
