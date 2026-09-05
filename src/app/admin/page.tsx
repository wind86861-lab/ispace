import { notFound, redirect } from "next/navigation";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";
import { SetupNotice } from "./SetupNotice";

/**
 * Har so'rovda qayta hisoblanadi: sessiya va sozlama ishga tushirish
 * vaqtida o'qilishi kerak, build vaqtida emas.
 */
export const dynamic = "force-dynamic";

/** `/admin` — kirish nuqtasi; birinchi bo'limga yuboradi. */
export default async function AdminPage() {
  if (!isAdminConfigured()) {
    // Production'da marshrut umuman mavjud emas; dev'da esa nima qilish
    // kerakligini aytamiz — jim 404 sozlamani xatodan ajratib bermaydi.
    if (process.env.NODE_ENV === "production") notFound();
    return <SetupNotice />;
  }
  if (!(await hasValidSession())) redirect("/admin/login");
  redirect("/admin/products");
}
