import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("error");
  const tc = await getTranslations("common");

  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-6xl text-gold">404</p>
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-espresso">
        {t("notFoundTitle")}
      </h1>
      <p className="measure text-sm leading-relaxed text-espresso-soft">{t("notFoundText")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-12 items-center rounded-full bg-gold px-7 text-sm font-medium text-warm-white transition-colors duration-300 hover:bg-gold-light"
      >
        {tc("toHome")}
      </Link>
    </div>
  );
}
