"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Heart, Menu, Phone, Scale, Search, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NavLink } from "./NavLink";
import type { Locale } from "@/i18n/routing";
import type { NavItem, SiteContact } from "@/content/types";
import { t as pick } from "@/lib/locale";
import {
  useShop,
  selectCartCount,
  selectWishlistCount,
  selectCompareCount,
} from "@/store/useShop";
import { useUi } from "@/store/useUi";
import { useLenis } from "@/components/providers/LenisProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";

/** Shu masofadan keyin header "frosted" holatga o'tadi. */
const FROSTED_AFTER = 24;

export function Header({ nav, contact }: { nav: NavItem[]; contact: SiteContact }) {
  const t = useTranslations("header");
  const locale = useLocale() as Locale;
  const lenis = useLenis();
  const open = useUi((s) => s.open);

  const hydrated = useShop((s) => s.hydrated);
  const cartCount = useShop(selectCartCount);
  const wishlistCount = useShop(selectWishlistCount);
  const compareCount = useShop(selectCompareCount);

  const [frosted, setFrosted] = useState(false);

  useEffect(() => {
    const onScroll = () => setFrosted(window.scrollY > FROSTED_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (href: string) => (e: React.MouseEvent) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    lenis.scrollTo(href);
  };

  return (
    <header
      data-frosted={frosted}
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter,padding] duration-500",
        "ease-[cubic-bezier(0.2,0.7,0.3,1)]",
        frosted
          ? "bg-cream/90 py-2 shadow-[0_1px_0_rgba(185,168,140,0.35)] backdrop-blur-xl"
          : "bg-transparent py-4",
      ].join(" ")}
    >
      <div className="container-lux flex items-center gap-4">
        <Link
          href="/"
          aria-label={t("logoAria")}
          className="font-display text-[1.45rem] tracking-[0.08em] text-espresso"
        >
          i<span className="text-gold-deep">Space</span>
        </Link>

        <nav aria-label={t("menuAria")} className="ml-8 hidden lg:block">
          <ul className="flex items-center gap-6">
            {nav.map((item) => (
              <li key={item._id}>
                <NavLink
                  href={item.href}
                  onAnchorClick={goTo(item.href)}
                  className="group relative inline-block py-2 text-[14px] text-espresso-soft transition-colors duration-300 hover:text-espresso"
                >
                  {pick(item.label, locale)}
                  {/* Oltin chiziq chapdan chiziladi */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-400 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-x-100"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3.5">
          <a
            href={contact.phoneHref}
            className="hidden items-center gap-2 text-[14px] text-espresso-soft transition-colors duration-300 hover:text-gold xl:inline-flex"
          >
            <Phone size={14} strokeWidth={1.5} aria-hidden="true" />
            {contact.phone}
          </a>

          {/* Til almashtirgich vizual ravishda ajratilgan: ikki yonida
              ingichka chiziq — u telefon va ikonlar bilan qo'shilib
              ketmaydi. */}
          <span aria-hidden="true" className="hidden h-5 w-px bg-taupe/40 xl:block" />
          <LanguageSwitcher className="hidden sm:flex" />
          <span aria-hidden="true" className="hidden h-5 w-px bg-taupe/40 sm:block" />

          <IconButton label={t("search")} onClick={() => open("search")}>
            <Search size={18} strokeWidth={1.4} aria-hidden="true" />
          </IconButton>

          <IconButton
            label={hydrated ? t("wishlistCount", { count: wishlistCount }) : t("wishlist")}
            onClick={() => open("wishlist")}
            badge={hydrated ? wishlistCount : 0}
          >
            <Heart size={18} strokeWidth={1.4} aria-hidden="true" />
          </IconButton>

          {/*
            Solishtirish — HAVOLA, panel emas: u alohida sahifa
            (`/compare`), chunki jadval keng va u yerda tanlov ustida
            ishlanadi. Savat va saralanganlar esa yon paneldan ochiladi.
          */}
          <Link
            href="/compare"
            aria-label={hydrated ? t("compareCount", { count: compareCount }) : t("compare")}
            className="relative grid size-10 place-items-center rounded-full text-espresso-soft transition-[color,background-color] duration-300 hover:bg-warm-white hover:text-gold"
          >
            <Scale size={18} strokeWidth={1.4} aria-hidden="true" />
            {hydrated && compareCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[11px] leading-4 font-semibold text-warm-white"
              >
                {compareCount}
              </span>
            )}
          </Link>

          <IconButton
            label={hydrated ? t("cartCount", { count: cartCount }) : t("cart")}
            onClick={() => open("cart")}
            badge={hydrated ? cartCount : 0}
          >
            <ShoppingBag size={18} strokeWidth={1.4} aria-hidden="true" />
          </IconButton>

          <IconButton label={t("openMenu")} onClick={() => open("menu")} className="lg:hidden">
            <Menu size={18} strokeWidth={1.4} aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <MobileNav nav={nav} contact={contact} />
    </header>
  );
}

function IconButton({
  label,
  onClick,
  children,
  badge = 0,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "relative grid size-10 place-items-center rounded-full text-espresso-soft",
        "transition-[color,background-color] duration-300 hover:bg-warm-white hover:text-gold",
        className,
      ].join(" ")}
    >
      {children}
      {badge > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[11px] leading-4 font-semibold text-warm-white"
        >
          {badge}
        </span>
      )}
    </button>
  );
}
