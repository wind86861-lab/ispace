"use client";

import { useServerInsertedHTML } from "next/navigation";

/**
 * Bo'yashdan **oldin** ishlaydigan boshlang'ich skript (§5/§14).
 *
 * Ikki qaror qabul qiladi va ularni `<html>` ga yozadi:
 *  · `data-motion` — kirish animatsiyalari yoqiladimi. `[data-reveal]`
 *    elementlari faqat shu atribut bo'lgandagina yashiriladi, ya'ni JS
 *    o'chiq bo'lsa kontent hech qachon ko'rinmay qolmaydi.
 *  · `data-preloader` — yuklash pardasi ko'rsatiladimi (sessiyada bir
 *    marta).
 *
 * NEGA `useServerInsertedHTML`:
 *
 * Skript React DARAXTIDA turmasligi kerak. Komponent ichidagi xom
 * `<script>` ni React 19 client tomonda hech qachon bajarmaydi va
 * konsolga ogohlantirish yozadi; `next/script` ning `beforeInteractive`
 * strategiyasi esa ILDIZ layout'ni talab qiladi, bu loyihada esa
 * `<html>` ni `[locale]/layout.tsx` chizadi (`lang` tilga bog'liq).
 *
 * `useServerInsertedHTML` skriptni faqat SERVER chizgan HTML'ga
 * qo'shadi — brauzer uni hujjatni o'qish paytida darrov bajaradi,
 * client daraxtida esa u umuman yo'q. Ya'ni na FOUC, na ogohlantirish.
 *
 * QO'RIQCHI (uchinchi vazifa)
 *
 * Kirish animatsiyasi kontentni CSS bilan `opacity: 0` da ushlab
 * turadi va uni faqat React effekti ochadi. Bu xavfli kelishuv: agar
 * hydration yiqilsa, HECH BIR effekt ishlamaydi va sayt butunlay
 * bo'sh ko'rinadi. Aynan shu yuz berdi — `Intl` server va brauzerda
 * boshqa natija bergani uchun (`lib/format.ts` dagi izohga qarang).
 *
 * Shuning uchun 4 soniyadan keyin bitta tekshiruv: birorta element
 * ochilganmi? Ochilmagan bo'lsa — React ishlamayapti, demak harakat
 * butunlay o'chiriladi va kontent ko'rinadi. Bu qo'riqchi React'ga
 * bog'liq emas: u shu inline skriptning o'zida yashaydi.
 *
 * Normal holatda u hech narsa qilmaydi: kuzatuvchi birinchi kadrda
 * kamida bitta elementni ochib bo'lgan bo'ladi.
 */
const MOTION_BOOT = `try{
var d=document.documentElement,r=matchMedia("(prefers-reduced-motion: reduce)").matches;
d.dataset.motion=r?"off":"on";
d.dataset.preloader=(r||sessionStorage.getItem("ispace-preloaded"))?"skip":"show";
setTimeout(function(){
if(d.dataset.motion!=="on")return;
if(document.querySelector("[data-revealed]"))return;
if(!document.querySelector("[data-reveal],[data-reveal-group]"))return;
d.dataset.motion="off";
},4000);
}catch(e){}`;

export function MotionBoot() {
  useServerInsertedHTML(() => (
    <script id="motion-boot" dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
  ));

  return null;
}
