"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("error");

  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-[clamp(2rem,5vw,3rem)] text-espresso">{t("title")}</h1>
      <p className="measure text-sm leading-relaxed text-espresso-soft">{t("text")}</p>
      <Button variant="gold" size="lg" className="mt-2" onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
