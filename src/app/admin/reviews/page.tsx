import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { ReviewsAdmin } from "./ReviewsAdmin";
import { readCollection } from "@/lib/store";
import { reviews as seedReviews } from "@/content/reviews";
import type { Review } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<Review>("reviews", seedReviews);

  return (
    <AdminShell
      active="reviews"
      title="Sharhlar"
      description="Mijozlar sharhlari. Matndan tashqari foto va YouTube video ham biriktirish mumkin — yuklanmagan foto saytda ko‘rsatilmaydi."
    >
      <ReviewsAdmin items={items} />
    </AdminShell>
  );
}
