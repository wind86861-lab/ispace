import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type Crumb = { label: string; href?: string };

/**
 * Non ushshoqlari. Oxirgi bo'g'in havola emas — u joriy sahifa,
 * shuning uchun `aria-current` bilan belgilanadi.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-espresso-soft/85">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-300 hover:text-gold-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-espresso">
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight
                  size={13}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-taupe"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
