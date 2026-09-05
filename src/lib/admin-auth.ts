import "server-only";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "ispace_admin";

/** Sessiya amal qilish muddati. */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 soat
/** Bitta IP uchun ketma-ket muvaffaqiyatsiz urinishlar chegarasi. */
const MAX_ATTEMPTS = 5;
/** Chegaradan oshgach qulflash muddati. */
const LOCKOUT_MS = 15 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Konfiguratsiya                                                      */
/* ------------------------------------------------------------------ */

/**
 * Admin **faqat** `ADMIN_PASSWORD` berilganda mavjud bo'ladi.
 * Bermasangiz — sahifa ham, API ham umuman yo'q (404/403). Ya'ni
 * tasodifan ochiq qolib ketishi mumkin emas: xavfsiz holat — sukut bo'yicha.
 */
export function adminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  return raw && raw.length >= 8 ? raw : null;
}

export const isAdminConfigured = () => adminPassword() !== null;

/**
 * Foydalanuvchi nomi. `ADMIN_USERNAME` berilmasa `admin`.
 *
 * Parol yolg'iz o'zi ham yetarli edi, lekin haqiqiy panelda kirish
 * "kim" va "nima bilan" degan ikki qismdan iborat bo'lishi kutiladi —
 * bu qo'shimcha to'siq ham beradi: to'g'ri parolni topgan bot nomni ham
 * bilishi kerak.
 */
export function adminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || "admin";
}

/**
 * Sessiya imzosi uchun kalit. Alohida `ADMIN_SESSION_SECRET` afzal;
 * berilmasa paroldan hosil qilinadi — bu holda parol o'zgarishi barcha
 * sessiyalarni bekor qiladi, bu ham to'g'ri xatti-harakat.
 */
function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `derived:${adminPassword() ?? ""}`;
}

/* ------------------------------------------------------------------ */
/* Parolni tekshirish                                                  */
/* ------------------------------------------------------------------ */

/**
 * Parol scrypt bilan solishtiriladi va taqqoslash doimiy vaqtda bo'ladi —
 * ya'ni javob qaytish tezligidan parol haqida ma'lumot sizib chiqmaydi.
 */
export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = adminPassword();
  if (!expected) return false;

  const salt = "ispace-admin-v1";
  const [a, b] = await Promise.all([
    scrypt(candidate, salt, 32),
    scrypt(expected, salt, 32),
  ]);
  return timingSafeEqual(a, b);
}

/**
 * Nom va parolni birgalikda tekshiradi.
 *
 * Nom ham `scrypt` orqali solishtiriladi — oddiy `===` javob vaqtini
 * belgi-belgi sizdirib, nomni taxmin qilishga yo'l ochardi. Ikkala
 * tekshiruv ham HAR DOIM bajariladi (`&&` bilan qisqartirilmaydi),
 * shunda "nom noto'g'ri" va "parol noto'g'ri" holatlari bir xil vaqt
 * oladi.
 */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const salt = "ispace-admin-user-v1";
  const [u1, u2] = await Promise.all([
    scrypt(username, salt, 32),
    scrypt(adminUsername(), salt, 32),
  ]);
  const nameOk = timingSafeEqual(u1, u2);
  const passOk = await verifyPassword(password);
  return nameOk && passOk;
}

/* ------------------------------------------------------------------ */
/* Sessiya tokeni                                                      */
/* ------------------------------------------------------------------ */

const b64u = (b: Buffer) => b.toString("base64url");

function sign(payload: string): string {
  return b64u(createHmac("sha256", sessionSecret()).update(payload).digest());
}

/** `<expiry>.<nonce>.<hmac>` — server holat saqlamaydi, imzo yetarli. */
export function createSessionToken(): string {
  const payload = `${Date.now() + SESSION_TTL_MS}.${b64u(randomBytes(12))}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiry, nonce, mac] = parts;
  const expected = sign(`${expiry}.${nonce}`);

  // Uzunliklar farq qilsa `timingSafeEqual` xato tashlaydi — avval tekshiramiz.
  const got = Buffer.from(mac);
  const want = Buffer.from(expected);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return false;

  const ms = Number(expiry);
  return Number.isFinite(ms) && ms > Date.now();
}

export async function hasValidSession(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Cookie sozlamalari.
 *
 * `secure` **haqiqiy protokolga** qarab qo'yiladi, `NODE_ENV` ga emas:
 * HTTPS ustida ishlaganda cookie faqat shifrlangan ulanish orqali
 * yuboriladi, lokal `http://localhost` da esa brauzer uni umuman
 * saqlamay qo'ymaydi. `NODE_ENV === "production"` ga bog'lash production
 * build'ni lokal HTTP da sinab ko'rishni buzadi.
 */
export function sessionCookieOptions(request?: Request) {
  const proto =
    request?.headers.get("x-forwarded-proto") ??
    (request ? new URL(request.url).protocol.replace(":", "") : "https");

  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: proto === "https",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

/* ------------------------------------------------------------------ */
/* Urinishlarni cheklash                                               */
/* ------------------------------------------------------------------ */

type Attempt = { count: number; until: number };
const attempts = new Map<string, Attempt>();

/** Qulflangan bo'lsa — qolgan soniyalar, aks holda 0. */
export function lockoutSeconds(ip: string): number {
  const a = attempts.get(ip);
  if (!a || a.count < MAX_ATTEMPTS) return 0;
  const left = a.until - Date.now();
  if (left <= 0) {
    attempts.delete(ip);
    return 0;
  }
  return Math.ceil(left / 1000);
}

export function registerFailure(ip: string): void {
  const a = attempts.get(ip) ?? { count: 0, until: 0 };
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) a.until = Date.now() + LOCKOUT_MS;
  attempts.set(ip, a);
}

export function clearFailures(ip: string): void {
  attempts.delete(ip);
}

/** Proksi ortida ham to'g'ri IP olinadi. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip"))?.trim() || "local";
}
