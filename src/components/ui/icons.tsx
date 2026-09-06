import {
  Armchair,
  Award,
  Bike,
  Bluetooth,
  CreditCard,
  Flame,
  Footprints,
  Hand,
  Headset,
  Layers,
  LayoutGrid,
  MapPin,
  Move3d,
  Orbit,
  Refrigerator,
  Route,
  ScanLine,
  Shield,
  Sofa,
  Sparkles,
  Truck,
  Volume2,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { FeatureIcon, IconName } from "@/content/types";

/**
 * Kontentdagi `IconName` → komponent. Ro'yxat yopiq bo'lgani uchun
 * `lucide-react` dan faqat shu ikonlar bundle'ga tushadi (§3).
 */
/** Mahsulot xususiyatlari ikonlari — alohida yopiq ro'yxat. */
export const FEATURE_ICONS: Record<FeatureIcon, LucideIcon> = {
  "zero-gravity": Orbit,
  "body-scan": ScanLine,
  bluetooth: Bluetooth,
  heat: Flame,
  "sl-track": Route,
  air: Wind,
  folding: Armchair,
  quiet: Volume2,
  "4d": Move3d,
};

export const ICONS: Record<IconName, LucideIcon> = {
  armchair: Armchair,
  award: Award,
  bike: Bike,
  elliptical: Orbit,
  grid: LayoutGrid,
  sofa: Sofa,
  treadmill: Footprints,
  vending: Refrigerator,
  "credit-card": CreditCard,
  hand: Hand,
  headset: Headset,
  layers: Layers,
  "map-pin": MapPin,
  shield: Shield,
  sparkles: Sparkles,
  truck: Truck,
  wrench: Wrench,
};

type BrandProps = { className?: string };

/**
 * Brend ikonlari — lucide v1 da olib tashlangan, shuning uchun qo'lda.
 * `currentColor` bilan ishlaydi, hover'da oltinga o'tadi.
 */
export function TelegramIcon({ className }: BrandProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.94 4.6 18.9 19.5c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.94.46l.33-4.78 8.7-7.86c.38-.34-.08-.53-.59-.19l-10.75 6.77-4.63-1.45c-1-.32-1.02-1 .21-1.49l18.1-6.98c.84-.3 1.57.2 1.28 1.11Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: BrandProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: BrandProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.54-1.5H16.7V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4.01 1.45-4.01 4.12v2.3H7.6V13h2.69v8h3.21Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: BrandProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22.2 7.2a2.65 2.65 0 0 0-1.86-1.88C18.7 4.87 12 4.87 12 4.87s-6.7 0-8.34.45A2.65 2.65 0 0 0 1.8 7.2C1.35 8.85 1.35 12 1.35 12s0 3.15.45 4.8a2.65 2.65 0 0 0 1.86 1.88c1.64.45 8.34.45 8.34.45s6.7 0 8.34-.45a2.65 2.65 0 0 0 1.86-1.88c.45-1.65.45-4.8.45-4.8s0-3.15-.45-4.8ZM9.9 15.15v-6.3L15.4 12l-5.5 3.15Z" />
    </svg>
  );
}