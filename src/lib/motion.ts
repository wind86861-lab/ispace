/**
 * Harakat tokenlari — barcha animatsiya shulardan oziqlanadi.
 * Bir joyda turgani uchun butun saytning ritmi bir xil bo'ladi.
 */

/** `--ease-lux` ning JS ekvivalenti (GSAP `CustomEase` siz ishlaydi). */
export const EASE_LUX = [0.2, 0.7, 0.3, 1] as const;

export const DUR = {
  /** Mikro-javob: hover, tugma bosilishi. */
  micro: 0.28,
  /** UI o'tishlari: drawer, modal, accordion. */
  ui: 0.45,
  /** Kontent kirishi — "nafas oladigan" tezlik. */
  reveal: 0.9,
  /** Hero orkestri va katta parda harakatlari. */
  cinematic: 1.1,
} as const;

/** Ketma-ket elementlar orasidagi kechikish. */
export const STAGGER = {
  tight: 0.06,
  base: 0.09,
  loose: 0.14,
} as const;

/** Framer Motion uchun tayyor spring — magnetic/tilt qaytishi. */
export const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.6 } as const;

/** ScrollTrigger uchun standart ishga tushish nuqtasi. */
export const TRIGGER_START = "top 82%";

/**
 * Harakat yoqilganmi — **sinxron** javob.
 *
 * `useReducedMotion()` React holati orqali ishlaydi va birinchi renderda
 * hali `false` bo'lishi mumkin; o'sha lahzada qurilgan GSAP tween'i esa
 * keyin bekor qilinmay qolib ketadi (natijada matn `opacity: 0.16` da
 * muzlab qoladi). `data-motion` atributini esa bo'yashdan oldingi inline
 * skript qo'yadi, ya'ni u BIRINCHI renderdayoq to'g'ri.
 */
export function motionEnabled(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "on";
}
