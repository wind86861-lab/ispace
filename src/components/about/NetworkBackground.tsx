"use client";

import { useMemo } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { useMediaTier } from "@/hooks/useMediaTier";

/**
 * Fon animatsiyasi: nuqtalar to'ri va ularni bog'lovchi chiziqlar
 * («network / connection»).
 *
 * Nega tsParticles va nega `slim`:
 *
 *  · to'liq to'plam (`@tsparticles/all`) o'nlab shakl va effektni olib
 *    keladi, bizga esa faqat `links` kerak — `slim` sezilarli yengil;
 *  · dvigatel `ParticlesProvider` orqali BIR MARTA yuklanadi; u
 *    yuklanmaguncha `<Particles>` hech narsa chizmaydi.
 *
 * Qachon UMUMAN chizilmaydi:
 *  · `prefers-reduced-motion` — §14 bo'yicha harakat o'chadi;
 *  · sensorli qurilma (`pointerFx` yo'q) — telefonda uzluksiz canvas
 *    batareyani yeydi va u yerda fon ustidagi parda ostida deyarli
 *    ko'rinmaydi ham.
 *
 * Ranglar palitradan: oltin nuqtalar va oltin chiziqlar. Ular parda
 * ostida yotadi, shuning uchun alfa past — maqsad "sezilar-sezilmas
 * harakat", ko'zga tashlanadigan bezak emas.
 */

/** Faqat `links` uchun kerakli qism — to'liq to'plam emas. */
const init = async (engine: Engine) => {
  await loadSlim(engine);
};

export function NetworkBackground() {
  const { reduced, pointerFx } = useMediaTier();

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },
      // 60 dan yuqorisi ko'zga hech narsa qo'shmaydi, quvvat esa yeydi.
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 46,
          // Zichlik MAYDONGA bog'lanadi: keng ekranda ham, tor ekranda
          // ham to'r bir xil siyrak ko'rinadi.
          density: { enable: true, width: 1600, height: 900 },
        },
        color: { value: "#c4a165" },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 2.5 } },
        links: {
          enable: true,
          distance: 150,
          color: "#c4a165",
          opacity: 0.28,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: "none",
          outModes: { default: "bounce" },
        },
      },
      interactivity: {
        events: {
          // Kursor yaqinlashganda to'r unga tortiladi — sahifa "tirik"
          // bo'lib qoladi, lekin bosishga javob bermaydi: bu fon.
          onHover: { enable: true, mode: "grab" },
        },
        modes: { grab: { distance: 170, links: { opacity: 0.45 } } },
      },
    }),
    [],
  );

  if (reduced || !pointerFx) return null;

  return (
    <ParticlesProvider init={init}>
      <Particles id="about-network" options={options} className="absolute inset-0" />
    </ParticlesProvider>
  );
}
