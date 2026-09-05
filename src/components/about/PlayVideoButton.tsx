"use client";

import { Play } from "lucide-react";
import { useUi } from "@/store/useUi";

/**
 * Video muqovasidagi tugma.
 *
 * Video `VideoLightbox` da ochiladi — sahifaga o'rnatilgan iframe
 * YouTube pleyerini har doim yuklab, sahifani bekorga og'irlashtirardi.
 */
export function PlayVideoButton({ label }: { label: string }) {
  const setVideoOpen = useUi((s) => s.setVideoOpen);

  return (
    <button
      type="button"
      onClick={() => setVideoOpen(true)}
      aria-label={label}
      className="group absolute inset-0 grid place-items-center bg-espresso/15 transition-colors duration-500 hover:bg-espresso/25"
    >
      <span className="grid size-16 place-items-center rounded-full bg-gold-deep text-warm-white shadow-lg transition-transform duration-500 group-hover:scale-110 sm:size-20">
        <Play size={24} strokeWidth={1.5} aria-hidden="true" fill="currentColor" />
      </span>
    </button>
  );
}
