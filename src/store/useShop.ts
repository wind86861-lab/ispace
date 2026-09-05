"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = { productId: string; qty: number };

/**
 * Solishtirishga qo'shilgan mahsulotlar chegarasi.
 *
 * Jadval ustunlari ekranga sig'ishi kerak: to'rttadan ortig'i desktopda
 * ham gorizontal scroll'siz o'qilmaydi. Chegaraga yetganda eng eskisi
 * chiqib ketadi — foydalanuvchiga "avval bittasini o'chiring" deb
 * to'sqinlik qilishdan ko'ra shunisi yumshoqroq.
 */
const MAX_COMPARE = 4;

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  /** Solishtirish ro'yxati — mahsulot `_id` lari, qo'shilish tartibida. */
  compare: string[];
  /** §7 — localStorage o'qilgunicha `false`; hisoblagich shu paytda chizilmaydi. */
  hydrated: boolean;

  addToCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  /** Bitta kategoriyani tozalash uchun — jadvaldagi "×" tugmasi. */
  removeManyFromCompare: (productIds: string[]) => void;
  clearCompare: () => void;
  clearCart: () => void;
  setHydrated: () => void;
};

const MAX_QTY = 99;

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      compare: [],
      hydrated: false,

      addToCart: (productId) =>
        set((s) => {
          const line = s.cart.find((l) => l.productId === productId);
          if (!line) return { cart: [...s.cart, { productId, qty: 1 }] };
          return {
            cart: s.cart.map((l) =>
              l.productId === productId ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l,
            ),
          };
        }),

      setQty: (productId, qty) =>
        set((s) => ({
          // 0 ga tushsa qator o'chadi — alohida "remove" chaqirish shart emas.
          cart:
            qty <= 0
              ? s.cart.filter((l) => l.productId !== productId)
              : s.cart.map((l) =>
                  l.productId === productId ? { ...l, qty: Math.min(qty, MAX_QTY) } : l,
                ),
        })),

      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) })),

      toggleWishlist: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.includes(productId)
            ? s.wishlist.filter((id) => id !== productId)
            : [...s.wishlist, productId],
        })),

      removeFromWishlist: (productId) =>
        set((s) => ({ wishlist: s.wishlist.filter((id) => id !== productId) })),

      toggleCompare: (productId) =>
        set((s) => {
          if (s.compare.includes(productId)) {
            return { compare: s.compare.filter((id) => id !== productId) };
          }
          // Chegaraga yetgan bo'lsa eng eskisi chiqadi (FIFO).
          const next = [...s.compare, productId];
          return { compare: next.slice(-MAX_COMPARE) };
        }),

      removeFromCompare: (productId) =>
        set((s) => ({ compare: s.compare.filter((id) => id !== productId) })),

      removeManyFromCompare: (productIds) =>
        set((s) => ({ compare: s.compare.filter((id) => !productIds.includes(id)) })),

      clearCompare: () => set({ compare: [] }),

      clearCart: () => set({ cart: [] }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "ispace-shop",
      /*
       * 2 — `compare` qo'shildi. Eski saqlangan holatda bu maydon yo'q,
       * shuning uchun `merge` da u massivga to'ldiriladi: aks holda
       * `compare.includes` birinchi chaqiruvda yiqilardi.
       */
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // Faqat ma'lumot saqlanadi — funksiyalar va `hydrated` emas.
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist, compare: s.compare }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<ShopState>;
        return { ...state, compare: state.compare ?? [] } as ShopState;
      },
      /**
       * §7 — avtomatik rehydrate ATAYLAB o'chirilgan. Server 0 chizadi,
       * client ham birinchi renderda 0 chizadi, so'ng `StoreProvider`
       * effektda qo'lda rehydrate qiladi. Natijada na hydration mismatch,
       * na hisoblagich miltillashi bo'ladi.
       */
      skipHydration: true,
    },
  ),
);

/* ------------------------------------------------------------------
   Tanlagichlar — komponent butun store'ga emas, faqat kerakli bo'lakka
   obuna bo'lishi uchun.
   ------------------------------------------------------------------ */
export const selectCartCount = (s: ShopState) => s.cart.reduce((sum, l) => sum + l.qty, 0);
export const selectWishlistCount = (s: ShopState) => s.wishlist.length;
export const selectInCart = (productId: string) => (s: ShopState) =>
  s.cart.some((l) => l.productId === productId);
export const selectInWishlist = (productId: string) => (s: ShopState) =>
  s.wishlist.includes(productId);
export const selectCompareCount = (s: ShopState) => s.compare.length;
export const selectInCompare = (productId: string) => (s: ShopState) =>
  s.compare.includes(productId);

export { MAX_COMPARE };
