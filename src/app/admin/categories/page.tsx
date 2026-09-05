import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { CategoriesAdmin } from "./CategoriesAdmin";
import { readCollection } from "@/lib/store";
import { categories as seedCategories } from "@/content/categories";
import type { Category } from "@/content/types";
import { readOverrides } from "@/lib/image-overrides";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const [items, overrides] = await Promise.all([
    readCollection<Category>("categories", seedCategories),
    readOverrides(),
  ]);

  // Ko'rsatish uchun yuklangan rasm; formaga xom yo'l boradi.
  const previews = Object.fromEntries(
    items.map((c) => {
      const raw = c.image.src;
      const hit = overrides[raw];
      return [c._id, (typeof hit === "string" ? hit : hit?.url) ?? raw];
    }),
  );

  return (
    <AdminShell
      active="categories"
      title="Kategoriyalar"
      description="Bosh sahifadagi kategoriya kartalari va katalogdagi filtr chiplari shu ro‘yxatdan olinadi."
    >
      <CategoriesAdmin items={items} previews={previews} />
    </AdminShell>
  );
}
