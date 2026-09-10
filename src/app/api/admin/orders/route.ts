import { NextResponse } from "next/server";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";
import { deleteOrder, readOrders, updateOrder } from "@/lib/orders";

/**
 * Buyurtmalarni boshqarish — faqat admin uchun.
 *
 * Yozish `api/admin/content` dagi bilan bir xil qatlamlarda
 * himoyalangan: sozlanmagan bo'lsa 404, sessiyasiz 401, CSRF
 * sarlavhasisiz 403.
 */
async function guard(request: Request, mutating: boolean) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin sozlanmagan" }, { status: 404 });
  }
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Sessiya tugagan. Qayta kiring." }, { status: 401 });
  }
  if (mutating && request.headers.get("x-requested-with") !== "ispace-admin") {
    return NextResponse.json({ error: "So‘rov rad etildi" }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = await guard(request, false);
  if (denied) return denied;
  return NextResponse.json({ items: await readOrders() });
}

export async function PATCH(request: Request) {
  const denied = await guard(request, true);
  if (denied) return denied;

  const { id, status } = (await request.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
  };
  if (!id) return NextResponse.json({ error: "id yo‘q" }, { status: 400 });
  if (!["new", "called", "done"].includes(String(status))) {
    return NextResponse.json({ error: "Noma’lum holat" }, { status: 400 });
  }

  const item = await updateOrder(id, { status: status as "new" | "called" | "done" });
  if (!item) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const denied = await guard(request, true);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id yo‘q" }, { status: 400 });

  await deleteOrder(id);
  return NextResponse.json({ ok: true });
}
