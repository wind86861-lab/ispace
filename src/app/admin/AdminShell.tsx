import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, CircleHelp, FileText, Handshake, Image as ImageIcon, LayoutGrid, MapPin, MessageSquareQuote, Package, Sparkles } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

/**
 * Panel qobig'i: chapda bo'limlar, o'ngda kontent.
 *
 * Bo'limlar ro'yxati shu yerda — yangi bo'lim qo'shish bitta qator.
 * Faol bo'lim `active` propi orqali beriladi (sahifaning o'zi biladi),
 * shunda qobiq client komponentga aylanmaydi va `usePathname` kerak
 * bo'lmaydi.
 */
export const ADMIN_SECTIONS = [
  { key: "products", href: "/admin/products", label: "Mahsulotlar", Icon: Package },
  { key: "categories", href: "/admin/categories", label: "Kategoriyalar", Icon: LayoutGrid },
  { key: "posts", href: "/admin/posts", label: "Maqolalar", Icon: FileText },
  { key: "reviews", href: "/admin/reviews", label: "Sharhlar", Icon: MessageSquareQuote },
  { key: "branches", href: "/admin/branches", label: "Filiallar", Icon: MapPin },
  { key: "badges", href: "/admin/badges", label: "Belgilar", Icon: BadgeCheck },
  { key: "lead-trust", href: "/admin/lead-trust", label: "Ishonch chizig‘i", Icon: Handshake },
  { key: "advantages", href: "/admin/advantages", label: "Afzalliklar", Icon: Sparkles },
  { key: "faq", href: "/admin/faq", label: "Savol-javob", Icon: CircleHelp },
  { key: "images", href: "/admin/images", label: "Rasmlar", Icon: ImageIcon },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]["key"];

export function AdminShell({
  active,
  title,
  description,
  actions,
  children,
}: {
  active: AdminSection;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-taupe/30 bg-warm-white lg:min-h-screen lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-5 lg:block">
          <p className="text-lg font-semibold tracking-tight text-espresso">
            i<span className="text-gold-deep">Space</span>
          </p>
          <div className="lg:hidden">
            <LogoutButton />
          </div>
        </div>

        <nav className="px-3 pb-4">
          <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
            {ADMIN_SECTIONS.map(({ key, href, label, Icon }) => {
              const on = key === active;
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={on ? "page" : undefined}
                    className={[
                      "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] whitespace-nowrap",
                      "transition-colors duration-300",
                      on
                        ? "bg-gold/12 text-gold-ink"
                        : "text-espresso-soft hover:bg-cream hover:text-espresso",
                    ].join(" ")}
                  >
                    <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden px-5 lg:block">
          <LogoutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-espresso">{title}</h1>
            {description && (
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-espresso-soft">
                {description}
              </p>
            )}
          </div>
          {actions}
        </div>

        {children}
      </main>
    </div>
  );
}
