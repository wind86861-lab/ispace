import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  clearFailures,
  clientIp,
  createSessionToken,
  isAdminConfigured,
  lockoutSeconds,
  registerFailure,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/admin-auth";

/** Kirish. Muvaffaqiyatli bo'lsa imzolangan httpOnly cookie qo'yiladi. */
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin sozlanmagan" }, { status: 404 });
  }

  const ip = clientIp(request);
  const locked = lockoutSeconds(ip);
  if (locked > 0) {
    return NextResponse.json(
      { error: `Juda ko‘p urinish. ${Math.ceil(locked / 60)} daqiqadan keyin urinib ko‘ring.` },
      { status: 429, headers: { "Retry-After": String(locked) } },
    );
  }

  const { username, password } = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  const ok =
    typeof username === "string" &&
    typeof password === "string" &&
    (await verifyCredentials(username, password));

  if (!ok) {
    registerFailure(ip);
    // Ataylab umumiy xabar: nom yoki parol — qaysi biri noto'g'riligini
    // aytmaymiz, aks holda mavjud nomni topish osonlashardi.
    return NextResponse.json({ error: "Login yoki parol noto‘g‘ri" }, { status: 401 });
  }

  clearFailures(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions(request));
  return res;
}

/** Chiqish. */
export async function DELETE(request: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(request), maxAge: 0 });
  return res;
}
