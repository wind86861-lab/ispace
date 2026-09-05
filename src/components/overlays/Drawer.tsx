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
  /** Sarlavha yonidagi kichik hisoblagich, masalan "2 товара". */
  meta?: string;
  side?: "right" | "left";
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Yon panel — savat, saralanganlar, mobil menyu va qidiruv shuni ishlatadi.
 *
 * Radix Dialog fokus tuzog'i, `Esc`, `aria-modal` va tashqariga bosishni
 * beradi; harakat esa Motion'da (§10: `AnimatePresence` — Motion hududi).
 */
export function Drawer({ open, onClose, title, meta, side = "right", children, footer }: Props) {
  const t = useTranslations("common");
  const lenis = useLenis();

  // Radix `body` ni bloklaydi, ammo Lenis o'z wheel oqimida ishlaydi —
  // uni alohida to'xtatish kerak, aks holda fon ostidan siljib ketadi.
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
                className="fixed inset-0 z-[70] bg-espresso/35 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.aside
                initial={{ x: side === "right" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: side === "right" ? "100%" : "-100%" }}
                transition={{ duration: DUR.ui + 0.1, ease: EASE_LUX }}
                className={[
                  "fixed inset-y-0 z-[80] flex w-full max-w-[26rem] flex-col bg-warm-white shadow-2xl",
                  side === "right" ? "right-0" : "left-0",
                ].join(" ")}
              >
                <header className="flex items-center gap-3 border-b border-taupe/25 px-6 py-5">
                  <Dialog.Title className="font-display text-xl text-espresso">
                    {title}
                  </Dialog.Title>
                  {meta && (
                    <span className="rounded-full bg-cream px-2.5 py-1 text-[12px] text-espresso-soft">
                      {meta}
                    </span>
                  )}
                  <Dialog.Close
                    aria-label={t("close")}
                    className="ml-auto grid size-9 place-items-center rounded-full text-espresso-soft transition-colors duration-300 hover:bg-cream hover:text-gold"
                  >
                    <X size={18} strokeWidth={1.5} aria-hidden="true" />
                  </Dialog.Close>
                </header>

                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                  {children}
                </div>

                {footer && (
                  <footer className="border-t border-taupe/25 px-6 py-5">{footer}</footer>
                )}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
