"use client";

import { useEffect, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DUR, EASE_LUX } from "@/lib/motion";
import { useLenis } from "@/components/providers/LenisProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Video va rasm uchun — keng, shaffof, ichki paddingsiz, sarlavhasiz. */
  wide?: boolean;
  /**
   * Panel kengligi (`wide` bo'lmagan holat uchun).
   *
   * `sm` — forma uchun bitta ustun. `lg` — matn, fotolar panjarasi va
   * video sig'adigan kengroq varaq. Ilgari kengroq panel kerak bo'lsa
   * `wide` ishlatilardi, lekin u panelning O'ZINI olib tashlaydi:
   * mazmun sahifa ustida osilib qolardi.
   */
  size?: "sm" | "lg";
};

/** Markazdagi modal — konsultatsiya formasi va video lightbox uchun. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
  size = "sm",
}: Props) {
  const t = useTranslations("common");
  const lenis = useLenis();

  useEffect(() => {
    lenis.setStopped(open);
    return () => lenis.setStopped(false);
  }, [open, lenis]);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.ui, ease: EASE_LUX }}
                className="fixed inset-0 z-[70] bg-espresso/45 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.99 }}
                transition={{ duration: DUR.ui, ease: EASE_LUX }}
                className={[
                  "fixed top-1/2 left-1/2 z-[80] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
                  /*
                    Panel EKRANDAN baland bo'lolmaydi.

                    `flex-col` + ichki `overflow-y-auto`: sarlavha va
                    yopish tugmasi joyida qoladi, faqat mazmun suriladi.
                    Butun panelni suradigan variantda yopish tugmasi
                    ham yuqoriga chiqib ketardi.
                  */
                  wide
                    ? "max-w-4xl"
                    : [
                        "flex max-h-[85svh] flex-col rounded-2xl bg-warm-white shadow-2xl",
                        size === "lg" ? "max-w-2xl" : "max-w-[26rem]",
                      ].join(" "),
                ].join(" ")}
              >
                <div className={wide ? "sr-only" : "shrink-0 px-7 pt-7 pr-16"}>
                  <Dialog.Title className="font-display text-2xl text-espresso">
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="mt-2 text-sm leading-relaxed text-espresso-soft">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                {!description && !wide && <Dialog.Description className="sr-only">{title}</Dialog.Description>}

                {wide ? children : <div className="min-h-0 flex-1 overflow-y-auto px-7 pt-5 pb-7">{children}</div>}

                <Dialog.Close
                  aria-label={t("close")}
                  className={[
                    "absolute grid size-9 place-items-center rounded-full transition-colors duration-300",
                    wide
                      ? "-top-12 right-0 text-cream hover:text-gold"
                      : "top-5 right-5 text-espresso-soft hover:bg-cream hover:text-gold",
                  ].join(" ")}
                >
                  <X size={18} strokeWidth={1.5} aria-hidden="true" />
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
