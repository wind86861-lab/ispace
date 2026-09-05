"use client";

/**
 * GSAP uchun yagona kirish nuqtasi.
 *
 * Plaginlar faqat shu yerda ro'yxatga olinadi va nomma-nom import qilinadi
 * (§3 bundle byudjeti) — komponentlar `gsap/all` ni hech qachon import
 * qilmaydi. SplitText va DrawSVGPlugin GSAP 3.13 dan beri bepul paket
 * ichida keladi, alohida litsenziya kerak emas.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };
