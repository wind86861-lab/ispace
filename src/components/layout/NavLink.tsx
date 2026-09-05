"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Menyu havolasi.
 *
 * Menyuda ikki xil manzil bor: bosh sahifadagi bo'limga olib boradigan
 * langar (`#branches`) va alohida sahifa (`/catalog`). Ular turlicha
 * ishlanadi:
 *
 *  · langar — oddiy `<a>`, bosilganda Lenis silliq siljitadi;
 *  · sahifa — `next-intl` ning `<Link>` i, u manzilga til prefiksini
 *    (`/ru/catalog`) o'zi qo'shadi va o'tish mijoz tomonida bo'ladi.
 *
 * Oddiy `<a href="/catalog">` bo'lsa brauzer prefiksiz manzilga borardi,
 * proxy uni `/ru/catalog` ga qayta yo'naltirardi — ya'ni har bosishda
 * ortiqcha redirect va to'liq sahifa yuklanishi.
 */
export function NavLink({
  href,
  onAnchorClick,
  className,
  children,
}: {
  href: string;
  onAnchorClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onAnchorClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onAnchorClick} className={className}>
      {children}
    </Link>
  );
}
