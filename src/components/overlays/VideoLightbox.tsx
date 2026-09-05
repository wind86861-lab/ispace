"use client";

import { useTranslations } from "next-intl";
import { Modal } from "./Modal";
import { useUi } from "@/store/useUi";

/**
 * Video lightbox.
 *
 * Ikki manba: admin yuklagan FAYL yoki YouTube. Fayl ustun turadi —
 * u mijozning o'z serverida, reklamasiz va uchinchi tomon kuzatuvisiz
 * o'ynaydi; YouTube esa fayl yuklanmagan holat uchun zaxira.
 *
 * Ikkalasi ham faqat modal ochilganda DOM'ga qo'shiladi: yopiq holatda
 * na iframe tortiladi, na video baytlari so'raladi (§3).
 */
export function VideoLightbox({
  youtubeId,
  title,
  file,
}: {
  youtubeId: string;
  title: string;
  /** Admin yuklagan video URL'i. Bo'lmasa YouTube ishlatiladi. */
  file?: string;
}) {
  const t = useTranslations("about");
  const open = useUi((s) => s.videoOpen);
  const setVideoOpen = useUi((s) => s.setVideoOpen);

  return (
    <Modal wide open={open} onClose={() => setVideoOpen(false)} title={title}>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-espresso shadow-2xl">
        {open &&
          (file ? (
            /*
              `controls` bor: bu to'liq pleyer. `autoPlay` `muted` siz
              ishlashi mumkin, chunki video foydalanuvchining o'z
              bosishidan keyin ochiladi — brauzer buni "user gesture"
              deb qabul qiladi va ovozni to'smaydi.
            */
            <video
              src={file}
              title={title}
              controls
              autoPlay
              playsInline
              className="size-full bg-espresso"
            />
          ) : (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={t("playVideo")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full border-0"
            />
          ))}
      </div>
    </Modal>
  );
}
