"use client";

import { useLocale, useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import type { NavItem, SiteContact } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { useUi } from "@/store/useUi";
import { useLenis } from "@/components/providers/LenisProvider";
import { Drawer } from "@/components/overlays/Drawer";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { NavLink } from "./NavLink";

export function MobileNav({ nav, contact }: { nav: NavItem[]; contact: SiteContact }) {
  const t = useTranslations("header");
  const tc = useTranslations("consult");
  const locale = useLocale() as Locale;
  const lenis = useLenis();

  const open = useUi((s) => s.overlay === "menu");
  const close = useUi((s) => s.close);
  const openOverlay = useUi((s) => s.open);

  const go = (href: string) => (e: React.MouseEvent) => {
    // Alohida sahifaga o'tishda `NavLink` `<Link>` chizadi va u o'z ishini
    // qiladi — bizga faqat panelni yopish qoladi.
    close();
    if (!href.startsWith("#")) return;
    e.preventDefault();
    // Drawer yopilish animatsiyasi tugagach siljiymiz — aks holda
    // scroll pozitsiyasi yopilish paytida "sakraydi".
    setTimeout(() => lenis.scrollTo(href), 320);
  };

  return (
    <Drawer open={open} onClose={close} title={t("menuAria")} side="left">
      <nav>
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item._id}>
              <NavLink
                href={item.href}
                onAnchorClick={go(item.href)}
                className="block rounded-lg px-3 py-3 font-display text-xl text-espresso transition-colors duration-300 hover:bg-cream hover:text-gold"
              >
                {pick(item.label, locale)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-4 border-t border-taupe/25 pt-6">
        <a
          href={contact.phoneHref}
          className="flex items-center gap-2 text-sm text-espresso-soft transition-colors duration-300 hover:text-gold"
        >
          <Phone size={15} strokeWidth={1.5} aria-hidden="true" />
          {contact.phone}
        </a>

        <Button
          variant="gold"
          size="md"
          withArrow
          className="w-full"
          onClick={() => openOverlay("consult")}
        >
          {tc("submit")}
        </Button>

        <LanguageSwitcher />
      </div>
    </Drawer>
  );
}
