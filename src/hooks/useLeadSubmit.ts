"use client";

import { useCallback, useRef, useState } from "react";
import type { SubmitStatus } from "@/components/ui/SubmitButton";

/** "Yuborildi" holati necha ms ko'rinib turadi. */
const SENT_HOLD_MS = 2600;

/**
 * Forma yuborish holatini boshqaradi (§8).
 *
 * Ariza `/api/order` ga ketadi va admin panelidagi «Buyurtmalar»
 * bo'limida paydo bo'ladi — savat buyurtmalari bilan BIR ro'yxatda.
 * Menejer uchun ular bir xil ish: qayta qo'ng'iroq qilish.
 *
 * Ilgari bu yerda `console.info` turardi va hech bir ariza hech
 * qayerga yetib bormasdi.
 */
export function useLeadSubmit<T extends object>(source: string) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [failed, setFailed] = useState(false);

  const send = useCallback(
    async (payload: T) => {
      setStatus("sending");
      setFailed(false);

      const p = payload as Record<string, unknown>;
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source,
          name: typeof p.name === "string" ? p.name : "",
          phone: typeof p.phone === "string" ? p.phone : "",
          /*
           * Qidiruv formasidagi «nimani qidiryapsiz» izohga tushadi:
           * menejer qo'ng'iroq qilishdan oldin mijoz nimaga
           * qiziqqanini biladi.
           */
          comment: typeof p.query === "string" ? p.query : undefined,
        }),
      }).catch(() => null);

      if (!res || !res.ok) {
        setStatus("idle");
        setFailed(true);
        return;
      }

      setStatus("sent");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("idle"), SENT_HOLD_MS);
    },
    [source],
  );

  return { status, send, failed };
}
