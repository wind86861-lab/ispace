"use client";

import { create } from "zustand";

/**
 * Qisqa xabarnomalar («toster»).
 *
 * Nega kerak: savatga qo'shish, saralanganlarga olish, solishtirishga
 * qo'shish — bularning hammasi sahifani O'ZGARTIRMAYDI. Javobsiz
 * qolgan bosish esa foydalanuvchini qayta-qayta bosishga majbur
 * qiladi. Ilgari javob sifatida savat paneli ochilardi, lekin u
 * ishni uzib qo'yardi: foydalanuvchi katalogni ko'rishda davom
 * etmoqchi edi.
 *
 * Nega tashqi kutubxona emas: kerak bo'lgani — navbat, avtomatik
 * yo'qolish va bitta animatsiya. Mavjud `zustand` va `motion` bilan
 * bu ellik qator, qo'shimcha bog'liqlik esa bundle byudjetidan
 * (§3) joy olardi.
 */
export type ToastTone = "default" | "success" | "warn";

export type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
  /** Ixtiyoriy amal — masalan «Savatni ochish». */
  action?: { label: string; run: () => void };
};

/** Bir vaqtda ko'rinadigan eng ko'p xabar — undan ortig'i ekranni yopadi. */
const MAX = 3;

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => number;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToast = create<ToastState>()((set) => ({
  toasts: [],

  push: (toast) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-MAX) }));
    return id;
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
