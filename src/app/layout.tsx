import type { ReactNode } from "react";

/**
 * Ildiz layout ataylab bo'sh: `<html>`/`<body>` ni `[locale]/layout.tsx`
 * chizadi, chunki `lang` atributi tilga bog'liq. Bu next-intl tavsiya
 * qiladigan tuzilish — u global `app/not-found.tsx` ishlashi uchun kerak.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
