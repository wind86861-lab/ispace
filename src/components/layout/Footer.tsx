"use client";

import { useLocale, useTranslations } from "next-intl";
import { Clock, Mail, Phone } from "lucide-react";
import type { Branch, NavItem, SiteContact } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { categories } from "@/content/categories";
import { useLenis } from "@/components/providers/LenisProvider";
import { FacebookIcon, InstagramIcon, TelegramIcon, YoutubeIcon } from "@/components/ui/icons";
import { NavLink } from "./NavLink";

export function Footer({
  nav,
  contact,
  branches,
}: {
  nav: NavItem[];
  contact: SiteContact;
  branches: Branch[];
}) {
  const t = useTranslations("footer");
  const locale = useLocale() as Locale;
  const lenis = useLenis();

  const go = (href: string) => (e: React.MouseEvent) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    lenis.scrollTo(href);
  };

  const socials = [
    { href: contact.telegram, label: "Telegram", Icon: TelegramIcon },
    { href: contact.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: contact.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: contact.youtube, label: "YouTube", Icon: YoutubeIcon },
  ];

  return (
    <footer className="mt-24 bg-espresso text-cream/75">
      <div className="container-lux grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <span className="font-display text-2xl tracking-[0.06em] text-cream">
            i<span className="text-gold-light">Space</span>
          </span>
          <p className="measure mt-4 text-[14px] leading-relaxed">{t("about")}</p>

          <ul className="mt-6 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-cream/15 text-cream/70 transition-colors duration-300 hover:border-gold hover:text-gold-light"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterColumn title={t("catalog")}>
          {categories.map((c) => (
            <li key={c._id}>
              <FooterLink href="#categories" onClick={go("#categories")}>
                {pick(c.title, locale)}
              </FooterLink>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={t("company")}>
          {nav.map((item) => (
            <li key={item._id}>
              <FooterLink href={item.href} onClick={go(item.href)}>
                {pick(item.label, locale)}
              </FooterLink>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={t("contacts")}>
          <li>
            <a
              href={contact.phoneHref}
              className="flex items-center gap-2 text-[14px] transition-colors duration-300 hover:text-gold-light"
            >
              <Phone size={14} strokeWidth={1.5} aria-hidden="true" />
              {contact.phone}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-[14px] transition-colors duration-300 hover:text-gold-light"
            >
              <Mail size={14} strokeWidth={1.5} aria-hidden="true" />
              {contact.email}
            </a>
          </li>
          <li className="flex items-start gap-2 text-[14px]">
            <Clock size={14} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
            {pick(branches[0].hours, locale)}
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-lux flex flex-col gap-2 py-6 text-[13px] text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p>{contact.email}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-[12px] tracking-[0.14em] text-cream/60 uppercase">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    /*
      `py-1` — bosish maydoni uchun. Yalang'och matn havolasi 18px
      balandlikda edi, WCAG 2.2 esa kamida 24×24 talab qiladi; qo'shimcha
      to'ldirish vizual jihatdan sezilmaydi, lekin barmoq bilan tegish
      ancha aniq bo'ladi.
    */
    <NavLink
      href={href}
      onAnchorClick={onClick}
      className="inline-block py-1 text-[14px] transition-colors duration-300 hover:text-gold-light"
    >
      {children}
    </NavLink>
  );
}
