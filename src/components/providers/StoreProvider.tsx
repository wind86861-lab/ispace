"use client";

import { useEffect } from "react";
import { useShop } from "@/store/useShop";

/**
 * §7 — `skipHydration: true` bo'lgani uchun localStorage'ni qo'lda o'qiymiz.
 * Bu birinchi renderdan **keyin** bo'ladi, ya'ni server va client bir xil
 * HTML chizadi va React hydration mismatch bermaydi.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve(useShop.persist.rehydrate()).then(() => {
      if (!cancelled) useShop.getState().setHydrated();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
