import type { LocaleString, PostBlock } from "./types";

/**
 * Maqolalar matni.
 *
 * `posts.ts` dan alohida: u ro'yxat uchun ixcham jadval bo'lib qolsin,
 * bu yerda esa uzun matn turadi. Kalit — maqolaning `_id` si.
 */

const L = (ru: string, uz: string, en: string): LocaleString => ({ ru, uz, en });
const p = (ru: string, uz: string, en: string): PostBlock => ({ kind: "paragraph", text: L(ru, uz, en) });
const h = (ru: string, uz: string, en: string): PostBlock => ({ kind: "heading", text: L(ru, uz, en) });
const q = (ru: string, uz: string, en: string, a?: LocaleString): PostBlock => ({
  kind: "quote",
  text: L(ru, uz, en),
  author: a,
});
const ul = (...items: LocaleString[]): PostBlock => ({ kind: "list", items });

export const postBodies: Record<string, PostBlock[]> = {
  "po-choose": [
    p(
      "Массажное кресло покупают один раз и надолго, поэтому решение стоит принимать не по картинке в каталоге. Ниже — критерии, которые действительно влияют на то, будете ли вы пользоваться креслом каждый день.",
      "Massaj kreslosi bir marta va uzoq muddatga olinadi, shuning uchun qarorni katalogdagi rasmga qarab qabul qilmaslik kerak. Quyida — kreslodan har kuni foydalanasizmi yoki yo‘qmi, shunga haqiqatan ta’sir qiladigan mezonlar.",
      "A massage chair is bought once and kept for years, so the decision should not rest on a catalogue photo. Below are the criteria that actually decide whether you will use it every day.",
    ),
    h("Тип направляющей", "Yo‘naltirgich turi", "Track type"),
    p(
      "S-образная направляющая повторяет изгиб позвоночника и работает по спине. SL-направляющая продолжается дальше — до ягодиц и бёдер. Если основная жалоба на поясницу, разница будет заметна с первого сеанса.",
      "S-shaklidagi yo‘naltirgich umurtqa egriligini takrorlaydi va bel bo‘ylab ishlaydi. SL-yo‘naltirgich esa undan davom etib, dumba va songacha yetadi. Asosiy shikoyat belga bo‘lsa, farq birinchi seansdayoq seziladi.",
      "An S-track follows the curve of the spine and works the back. An SL-track continues further, down to the glutes and hips. If your main complaint is the lower back, the difference shows from the first session.",
    ),
    h("На что смотреть ещё", "Yana nimaga qarash kerak", "What else to check"),
    ul(
      L("Диапазон роста — кресло должно подходить всем в семье", "Bo‘y diapazoni — kreslo oiladagi hammaga to‘g‘ri kelsin", "Height range — the chair must fit everyone at home"),
      L("Реальный уровень шума: вечером тихий привод важнее лишней программы", "Haqiqiy shovqin darajasi: kechqurun tinch dvigatel ortiqcha dasturdan muhimroq", "Real noise level: a quiet drive matters more in the evening than an extra programme"),
      L("Зазор до стены — компактным креслам хватает 10–15 см", "Devorgacha bo‘shliq — ixcham kreslolarga 10–15 sm yetadi", "Wall clearance — compact chairs need only 10–15 cm"),
      L("Сервис и гарантия в вашем городе, а не «через поставщика»", "Xizmat va kafolat sizning shahringizda bo‘lsin, «ta’minotchi orqali» emas", "Service and warranty in your city, not «through the supplier»"),
    ),
    q(
      "Лучший способ выбрать — сесть в кресло на 10 минут. Ощущение от массажа субъективно, и никакой список характеристик его не заменит.",
      "Tanlashning eng yaxshi yo‘li — kresloda 10 daqiqa o‘tirish. Massaj hissi subyektiv va uni hech qanday xarakteristikalar ro‘yxati almashtira olmaydi.",
      "The best way to choose is to sit in the chair for ten minutes. The feel of a massage is subjective, and no spec sheet replaces it.",
    ),
  ],

  "po-back": [
    p(
      "После рабочего дня за компьютером напряжение копится в шее, плечах и пояснице. Пятнадцати минут вечером достаточно, чтобы снять его — если делать это последовательно.",
      "Kompyuter oldidagi ish kunidan keyin taranglik bo‘yin, yelka va belda to‘planadi. Kechqurun o‘n besh daqiqa uni yozish uchun yetarli — agar ketma-ket bajarilsa.",
      "After a desk-bound day, tension gathers in the neck, shoulders and lower back. Fifteen minutes in the evening is enough to release it — if you do it in order.",
    ),
    h("Программа на 15 минут", "15 daqiqalik dastur", "A 15-minute routine"),
    ul(
      L("5 минут — разогрев спины на низкой интенсивности", "5 daqiqa — belni past shiddatda isitish", "5 minutes — warming the back at low intensity"),
      L("5 минут — режим невесомости, ноги выше уровня сердца", "5 daqiqa — vaznsizlik rejimi, oyoq yurak sathidan yuqorida", "5 minutes — zero gravity, legs above heart level"),
      L("5 минут — точечная проработка поясницы с прогревом", "5 daqiqa — belni isitish bilan nuqtali ishlov", "5 minutes — targeted lower-back work with heating"),
    ),
    p(
      "Важно закончить сеанс не позже чем за час до сна: телу нужно время, чтобы перейти в спокойное состояние. И не увеличивайте интенсивность «для эффекта» — глубокие мышцы расслабляются от регулярности, а не от силы.",
      "Seansni uxlashdan kamida bir soat oldin tugatish muhim: tanaga tinch holatga o‘tish uchun vaqt kerak. Shiddatni «samara uchun» oshirmang ham — chuqur mushaklar kuchdan emas, muntazamlikdan bo‘shashadi.",
      "Finish at least an hour before bed: the body needs time to settle. And do not raise the intensity «for effect» — deep muscles release through regularity, not force.",
    ),
  ],

  "po-tech": [
    p(
      "За последние годы массажные кресла изменились сильнее, чем за предыдущее десятилетие. Разбираем, что из этого реально влияет на ощущения, а что остаётся строчкой в описании.",
      "So‘nggi yillarda massaj kreslolari oldingi o‘n yillikdagidan ko‘ra ko‘proq o‘zgardi. Shulardan qaysi biri hisga haqiqatan ta’sir qilishini, qaysi biri esa tavsifdagi qator bo‘lib qolishini ko‘rib chiqamiz.",
      "Massage chairs have changed more in recent years than in the previous decade. Here is what genuinely changes the experience — and what stays a line in the spec sheet.",
    ),
    h("Сканирование тела", "Tana skaneri", "Body scan"),
    p(
      "Перед сеансом кресло измеряет длину спины и положение плеч, после чего подстраивает траекторию роликов. Это не маркетинг: без сканирования одна и та же программа по-разному ложится на людей разного роста.",
      "Seansdan oldin kreslo bel uzunligi va yelka holatini o‘lchaydi, so‘ng roliklar yo‘lini moslashtiradi. Bu marketing emas: skanersiz bir xil dastur turli bo‘ydagi odamlarga har xil tushadi.",
      "Before the session the chair measures back length and shoulder position, then adapts the roller path. This is not marketing: without a scan, the same programme lands differently on people of different heights.",
    ),
    h("4D против 3D", "4D va 3D", "4D versus 3D"),
    p(
      "3D-механизм двигается по трём осям, 4D добавляет управление скоростью и ритмом нажатия. На практике это ближе к работе рук массажиста: давление нарастает и отпускает, а не держится ровным.",
      "3D-mexanizm uch o‘q bo‘ylab harakatlanadi, 4D esa bosim tezligi va ritmini boshqarishni qo‘shadi. Amalda bu massajchi qo‘llariga yaqinroq: bosim ortadi va qo‘yib yuboradi, bir tekis turmaydi.",
      "A 3D mechanism moves along three axes; 4D adds control over the speed and rhythm of the press. In practice it comes closer to a therapist's hands: pressure builds and releases instead of staying flat.",
    ),
  ],

  "po-care": [
    p(
      "Обивка кресла живёт дольше, чем кажется, — если не мыть её тем, что стоит под раковиной. Несколько правил, которых достаточно.",
      "Kreslo qoplamasi ko‘ringanidan uzoq xizmat qiladi — agar uni rakovina tagidagi vosita bilan yuvmasangiz. Yetarli bo‘lgan bir necha qoida.",
      "Upholstery lasts longer than people expect — as long as you do not clean it with whatever is under the sink. A few rules are enough.",
    ),
    ul(
      L("Протирайте мягкой влажной тканью раз в неделю, без спирта и растворителей", "Haftada bir marta yumshoq nam mato bilan arting — spirt va erituvchisiz", "Wipe with a soft damp cloth weekly — no alcohol or solvents"),
      L("Держите кресло вдали от прямого солнца: экокожа выцветает и грубеет", "Kreslani to‘g‘ridan-to‘g‘ri quyoshdan uzoqroq saqlang: ekoteri rangi ketadi va qattiqlashadi", "Keep it out of direct sun: eco-leather fades and stiffens"),
      L("Пятна убирайте сразу — засохшие требуют трения, а оно портит покрытие", "Dog‘larni darrov ketkazing — qurigani ishqalashni talab qiladi, u esa qoplamani buzadi", "Remove stains at once — dried ones need rubbing, and rubbing ruins the finish"),
      L("Раз в полгода проверяйте крепления подлокотников и подножки", "Yarim yilda bir marta tirsak va oyoq qo‘yish qismlari mahkamligini tekshiring", "Every six months, check the armrest and footrest fixings"),
    ),
    p(
      "Если кресло стоит в шоуруме или офисе и работает целый день, интервал ухода стоит сократить вдвое — нагрузка на обивку там выше в разы.",
      "Kreslo shourum yoki ofisda turib kun bo‘yi ishlasa, parvarish oralig‘ini ikki barobar qisqartiring — u yerda qoplamaga yuk bir necha barobar ko‘p.",
      "If the chair sits in a showroom or office and runs all day, halve the maintenance interval — the load on the upholstery there is several times higher.",
    ),
  ],

  "po-office": [
    p(
      "Офисное кресло влияет на продуктивность сильнее, чем кажется: неудобная посадка сначала отвлекает, а через полгода превращается в боль в пояснице.",
      "Ofis kreslosi mahsuldorlikka ko‘ringanidan ko‘proq ta’sir qiladi: noqulay o‘tirish avvaliga chalg‘itadi, yarim yildan keyin esa bel og‘rig‘iga aylanadi.",
      "An office chair affects productivity more than people think: an awkward seat first distracts, then turns into lower-back pain within six months.",
    ),
    h("Что проверять при закупке", "Xarid qilishda nimani tekshirish kerak", "What to check when buying"),
    ul(
      L("Регулировка поясничной поддержки по высоте, а не только по глубине", "Bel suyanchig‘i balandligi bo‘yicha ham sozlansin, faqat chuqurligi emas", "Lumbar support adjustable in height, not only depth"),
      L("Подлокотники с регулировкой — под разный рост сотрудников", "Sozlanadigan tirsak qo‘yish joylari — turli bo‘ydagi xodimlar uchun", "Adjustable armrests — for staff of different heights"),
      L("Ресурс газлифта: для сменной работы берите усиленный", "Gazlift resursi: smenali ish uchun kuchaytirilganini oling", "Gas-lift rating: choose the reinforced version for shift work"),
    ),
    p(
      "Для команды от десяти человек имеет смысл заказать два-три образца и дать сотрудникам посидеть неделю. Это дешевле, чем менять партию из тридцати кресел.",
      "O‘n kishidan katta jamoa uchun ikki-uchta namuna buyurtma qilib, xodimlarga bir hafta o‘tirib ko‘rishga berish ma’qul. Bu o‘ttizta kreslodan iborat partiyani almashtirishdan arzonroq.",
      "For a team of ten or more, order two or three samples and let people sit on them for a week. That is cheaper than replacing a batch of thirty.",
    ),
  ],

  "po-showroom": [
    p(
      "Мы открыли шестой шоурум iSpace — в Бухаре. Теперь протестировать кресла можно и там, без поездки в Ташкент.",
      "Biz oltinchi iSpace shourumini ochdik — Buxoroda. Endi kreslolarni Toshkentga bormasdan, o‘sha yerda sinab ko‘rish mumkin.",
      "We have opened the sixth iSpace showroom — in Bukhara. You can now try the chairs there, without travelling to Tashkent.",
    ),
    p(
      "В зале представлены массажные и офисные кресла, беговые дорожки и велотренажёры. Работает собственная сервисная служба: доставка, установка и обучение входят в стоимость.",
      "Zalda massaj va ofis kreslolari, yugurish yo‘lakchalari va velotrenajyorlar qo‘yilgan. O‘z servis xizmati ishlaydi: yetkazib berish, o‘rnatish va o‘rgatish narxga kiradi.",
      "The floor shows massage and office chairs, treadmills and exercise bikes. Our own service team works there: delivery, installation and training are included.",
    ),
    q(
      "Мы открываем шоурум там, где уже есть наши клиенты. В Бухаре их достаточно, чтобы держать полноценный сервис, а не точку выдачи.",
      "Biz shourumni mijozlarimiz allaqachon bor joyda ochamiz. Buxoroda ular yetarli — to‘liq servis ushlab turish uchun, oddiy topshirish nuqtasi emas.",
      "We open a showroom where our customers already are. In Bukhara there are enough of them to keep a full service centre, not just a pickup point.",
    ),
  ],
};
