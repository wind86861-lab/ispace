import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "iSpace — boshqaruv paneli",
  // Indekslanmasin: bu ichki vosita.
  robots: { index: false, follow: false },
  // Sayt layout'i o'z ikonini beradi, admin esa alohida `<html>` chizadi —
  // ko'rsatilmasa brauzer `/favicon.ico` ni so'rab 404 oladi.
  icons: { icon: "/favicon.svg" },
};

/**
 * Admin o'z layout'ida: bu yerda til, Lenis, GSAP va sayt chrome'i kerak
 * emas — sahifa iloji boricha yengil va oldindan aytib bo'ladigan bo'lsin.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={manrope.variable}>
      <body className="bg-cream text-espresso-soft antialiased">{children}</body>
    </html>
  );
}
