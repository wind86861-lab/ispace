"use client";

import { useCallback, useRef, useState } from "react";
import type { SubmitStatus } from "@/components/ui/SubmitButton";

/** "Yuborildi" holati necha ms ko'rinib turadi. */
const SENT_HOLD_MS = 2600;

/**
 * Forma yuborish holatini boshqaradi (§8).
 *
 * Backend hali yo'q — bu bosqichda arizani konsolga chiqaramiz va
 * tarmoq kechikishini taqlid qilamiz. Real endpoint ulanganda faqat
 * `send` ichidagi blok almashadi, komponentlar o'zgarmaydi.
 */
export function useLeadSubmit<T extends object>(source: string) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = useCallback(
    async (payload: T) => {
      setStatus("sending");

      // TODO(backend): POST /api/lead — hozircha stub.
      console.info("[lead]", source, payload);
      await new Promise((resolve) => setTimeout(resolve, 700));

      setStatus("sent");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("idle"), SENT_HOLD_MS);
    },
    [source],
  );

  return { status, send };
}
