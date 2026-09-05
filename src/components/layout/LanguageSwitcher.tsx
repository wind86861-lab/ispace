"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = { ru: "RU", uz: "UZ", en: "EN" };

/**
 * Til almashtirgich. Marshrutni next-intl navigatsiyasi orqali almashtiradi,
 * shuning uchun joriy sahifada qolib, faqat prefiks o'zgaradi.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("header");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="group"
      aria-label={t("languageAria")}
    >
      <Globe size={14} strokeWidth={1.5} aria-hidden="true" className="mr-1 text-taupe-text" />
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-current={active ? "true" : undefined}
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                router.replace(
                  // @ts-expect-error — pathname dinamik, params tipi marshrutga bog'liq
                  { pathname, params },
                  { locale: l },
                );
              })
            }
            className={[
              "rounded-full px-2 py-1 text-[12px] font-semibold tracking-[0.08em] transition-colors duration-300",
              // Frosted header foni ostidan to'q bo'lim o'tishi mumkin —
              // shuning uchun zaxirasi bor ranglar (§ gold-ink izohiga qarang).
              active ? "text-gold-ink" : "text-espresso-soft hover:text-espresso",
            ].join(" ")}
          >
            {LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
