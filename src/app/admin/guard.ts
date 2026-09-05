import { notFound, redirect } from "next/navigation";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";

/**
 * Har admin sahifasining birinchi qatori.
 *
 * Sozlanmagan bo'lsa production'da marshrut umuman yo'q (404) — panel
 * tasodifan ochiq qolib ketishi mumkin emas. Sessiya yo'q bo'lsa kirish
 * sahifasiga yuboriladi.
 */
export async function requireAdmin(): Promise<void> {
  if (!isAdminConfigured()) notFound();
  if (!(await hasValidSession())) redirect("/admin/login");
}
