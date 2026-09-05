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
 */
const MOTION_BOOT = `try{
var d=document.documentElement,r=matchMedia("(prefers-reduced-motion: reduce)").matches;
d.dataset.motion=r?"off":"on";
d.dataset.preloader=(r||sessionStorage.getItem("ispace-preloaded"))?"skip":"show";
}catch(e){}`;

export function MotionBoot() {
  useServerInsertedHTML(() => (
    <script id="motion-boot" dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
  ));

  return null;
}
