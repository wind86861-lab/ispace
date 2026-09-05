"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as Accordion from "@radix-ui/react-accordion";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import type { FaqItem } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { DUR, EASE_LUX } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * FAQ — ikki ustunli akkordeon.
 *
 * Radix a11y'ni beradi (`button`, `aria-expanded`, klaviatura, `region`),
 * Motion esa balandlik va `＋ → ✕` burilishini animatsiya qiladi (§10).
 * Radix'ning o'z CSS animatsiyasi o'rniga Motion ishlatilgani uchun
 * `forceMount` bilan ochiq element o'zimiz boshqaramiz.
 */
export function Faq({ faq }: { faq: FaqItem[] }) {
  const t = useTranslations("faq");
  const locale = useLocale() as Locale;
  const [value, setValue] = useState<string>("");

  // Ikki ustun: birinchi yarmi chapda, ikkinchisi o'ngda — o'qish tartibi
  // ustun bo'ylab pastga ketadi, chapdan-o'ngga sakramaydi.
  const half = Math.ceil(faq.length / 2);
  const columns = [faq.slice(0, half), faq.slice(half)];

  return (
    <section id="faq" className="scroll-mt-28 bg-alabaster py-20 sm:py-24 border-y border-taupe/25">
      <div className="container-lux">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <Accordion.Root
          type="single"
          collapsible
          value={value}
          onValueChange={setValue}
          className="mt-12 grid gap-3 lg:grid-cols-2 lg:gap-x-4"
        >
          {columns.map((column, ci) => (
            <div key={ci} className="space-y-3">
              {column.map((item, i) => (
                <Reveal key={item._id} delay={i * 0.05}>
                  <Accordion.Item
                    value={item._id}
                    className="overflow-hidden rounded-xl border border-taupe/30 bg-warm-white transition-colors duration-300 data-[state=open]:border-gold/45"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex w-full items-center gap-4 px-5 py-4 text-left">
                        <span className="flex-1 text-[15px] leading-snug text-espresso">
                          {pick(item.question, locale)}
                        </span>
                        <span
                          aria-hidden="true"
                          className="grid size-8 shrink-0 place-items-center rounded-full border border-taupe/40 text-espresso-soft transition-[transform,color,border-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:border-gold group-hover:text-gold group-data-[state=open]:rotate-45 group-data-[state=open]:border-gold group-data-[state=open]:text-gold"
                        >
                          <Plus size={15} strokeWidth={1.7} />
                        </span>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <AnimatePresence initial={false}>
                      {value === item._id && (
                        <Accordion.Content forceMount asChild>
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: DUR.ui, ease: EASE_LUX }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-[14px] leading-relaxed text-espresso-soft">
                              {pick(item.answer, locale)}
                            </p>
                          </motion.div>
                        </Accordion.Content>
                      )}
                    </AnimatePresence>
                  </Accordion.Item>
                </Reveal>
              ))}
            </div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
