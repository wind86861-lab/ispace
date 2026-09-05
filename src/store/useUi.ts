"use client";

import { create } from "zustand";

/** Bir vaqtda faqat bitta qatlam ochiq bo'ladi. */
export type Overlay = "cart" | "wishlist" | "consult" | "menu" | "search" | null;

type UiState = {
  overlay: Overlay;
  /** Video lightbox alohida — u boshqa qatlam ustidan ochilishi mumkin. */
  videoOpen: boolean;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  toggle: (overlay: Exclude<Overlay, null>) => void;
  setVideoOpen: (open: boolean) => void;
};

/** Bu holat saqlanmaydi — sahifa yangilanganda hamma qatlam yopiq. */
export const useUi = create<UiState>()((set) => ({
  overlay: null,
  videoOpen: false,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
  toggle: (overlay) => set((s) => ({ overlay: s.overlay === overlay ? null : overlay })),
  setVideoOpen: (videoOpen) => set({ videoOpen }),
}));
