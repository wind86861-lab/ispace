import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";
import { readCollection, writeCollection, type CollectionName } from "@/lib/store";
import {
  ValidationError,
  validateCategory,
  validatePost,
  validateProduct,
  validateReview,
  validateBranch,
  validateFaqItem,
  validateAdvantage,
  validateBadge,
  validateTrustPoint,
} from "@/lib/content-validation";
import { products as seedProducts } from "@/content/products";
import { categories as seedCategories } from "@/content/categories";
import { posts as seedPosts } from "@/content/posts";
import { reviews as seedReviews } from "@/content/reviews";
import { branches as seedBranches } from "@/content/branches";
import { faq as seedFaq } from "@/content/faq";
import { advantages as seedAdvantages } from "@/content/advantages";
import { badges as seedBadges } from "@/content/badges";
import { leadTrust as seedLeadTrust } from "@/content/lead-trust";
import type {
  Advantage,
  Badge,
  Branch,
  Category,
  FaqItem,
  Post,
  Product,
  Review,
  TrustPoint,
} from "@/content/types";

/**
 * Kontent CRUD.
 *
 * Himoya `images` marshrutidagi bilan bir xil qatlamlarda:
 *  · `ADMIN_PASSWORD` berilmasa marshrut umuman yo'q (404);
 *  · sessiyasiz 401;
 *  · o'zgartirish uchun `X-Requested-With: ispace-admin` (CSRF);
 *  · kelgan ma'lumot `content-validation` da qayta yig'iladi — mijoz
 *    yuborgan ortiqcha maydon omborga tushmaydi.
 */

type Entity =
  | Product
  | Category
  | Post
  | Review
  | Branch
  | FaqItem
  | Advantage
  | Badge
  | TrustPoint;

/**
 * `slug` — faqat manzilga tushadigan yozuvlarda bor (mahsulot,
 * kategoriya, maqola). Sharhda yo'q, shuning uchun takrorlanish
 * tekshiruvi ham unga tegmasligi kerak: aks holda `undefined ===
 * undefined` mos kelib, ikkinchi sharhni saqlashda soxta 409 chiqadi.
 */
const slugOf = (e: Entity): string | undefined =>
  "slug" in e && typeof e.slug === "string" ? e.slug : undefined;

const COLLECTIONS: Record<string, { seed: Entity[]; validate: (i: unknown, e?: never) => Entity }> = {
  products: {
    seed: seedProducts,
    validate: (i, e) => validateProduct(i, e as Product | undefined),
  },
  categories: {
    seed: seedCategories,
    validate: (i, e) => validateCategory(i, e as Category | undefined),
  },
  posts: {
    seed: seedPosts,
    validate: (i, e) => validatePost(i, e as Post | undefined),
  },
  reviews: {
    seed: seedReviews,
    validate: (i, e) => validateReview(i, e as Review | undefined),
  },
  branches: {
    seed: seedBranches,
    validate: (i, e) => validateBranch(i, e as Branch | undefined),
  },
  faq: {
    seed: seedFaq,
    validate: (i, e) => validateFaqItem(i, e as FaqItem | undefined),
  },
  advantages: {
    seed: seedAdvantages,
    validate: (i, e) => validateAdvantage(i, e as Advantage | undefined),
  },
  badges: {
    seed: seedBadges,
    validate: (i, e) => validateBadge(i, e as Badge | undefined),
  },
  leadTrust: {
    seed: seedLeadTrust,
    validate: (i, e) => validateTrustPoint(i, e as TrustPoint | undefined),
  },
};

async function guard(request: Request, collection: string, mutating: boolean) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin sozlanmagan" }, { status: 404 });
  }
  if (!(collection in COLLECTIONS)) {
    return NextResponse.json({ error: "Noma’lum bo‘lim" }, { status: 404 });
  }
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Sessiya tugagan. Qayta kiring." }, { status: 401 });
  }
  if (mutating && request.headers.get("x-requested-with") !== "ispace-admin") {
    return NextResponse.json({ error: "So‘rov rad etildi" }, { status: 403 });
  }
  return null;
}

const load = (name: string) =>
  readCollection(name as CollectionName, COLLECTIONS[name].seed);

async function save(name: string, items: Entity[]) {
  await writeCollection(name as CollectionName, items);
  // Sayt statik chizilgan — yangi kontent ko'rinishi uchun qayta hosil qilamiz.
  revalidatePath("/", "layout");
}

function badRequest(e: unknown) {
  if (e instanceof ValidationError) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  throw e;
}

type Ctx = { params: Promise<{ collection: string }> };

/** Ro'yxat. */
export async function GET(request: Request, { params }: Ctx) {
  const { collection } = await params;
  const denied = await guard(request, collection, false);
  if (denied) return denied;

  return NextResponse.json({ items: await load(collection) });
}

/** Yangi yozuv. */
export async function POST(request: Request, { params }: Ctx) {
  const { collection } = await params;
  const denied = await guard(request, collection, true);
  if (denied) return denied;

  try {
    const body = await request.json();
    const item = COLLECTIONS[collection].validate(body);
    const items = await load(collection);

    const slug = slugOf(item);
    if (slug && items.some((x) => slugOf(x) === slug)) {
      return NextResponse.json({ error: "Bunday slug allaqachon bor" }, { status: 409 });
    }

    await save(collection, [...items, item]);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}

/** Mavjud yozuvni yangilash. */
export async function PUT(request: Request, { params }: Ctx) {
  const { collection } = await params;
  const denied = await guard(request, collection, true);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id berilmagan" }, { status: 400 });

  try {
    const items = await load(collection);
    const index = items.findIndex((x) => x._id === id);
    if (index === -1) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    const body = await request.json();
    const item = COLLECTIONS[collection].validate(body, items[index] as never);

    const slug = slugOf(item);
    const clash = slug != null && items.some((x, i) => i !== index && slugOf(x) === slug);
    if (clash) return NextResponse.json({ error: "Bunday slug allaqachon bor" }, { status: 409 });

    const next = [...items];
    next[index] = item;
    await save(collection, next);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return badRequest(e);
  }
}

/** O'chirish. */
export async function DELETE(request: Request, { params }: Ctx) {
  const { collection } = await params;
  const denied = await guard(request, collection, true);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id berilmagan" }, { status: 400 });

  const items = await load(collection);
  const next = items.filter((x) => x._id !== id);
  if (next.length === items.length) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await save(collection, next);
  return NextResponse.json({ ok: true });
}
