import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { ProductsAdmin } from "./ProductsAdmin";
import { readCollection } from "@/lib/store";
import { products as seedProducts } from "@/content/products";
import { categories as seedCategories } from "@/content/categories";
import { badges as seedBadges } from "@/content/badges";
import type { Badge, Category, Product } from "@/content/types";
import { readOverrides } from "@/lib/image-overrides";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  const [items, categories, badges, overrides] = await Promise.all([
    readCollection<Product>("products", seedProducts),
    readCollection<Category>("categories", seedCategories),
    readCollection<Badge>("badges", seedBadges),
    readOverrides(),
  ]);

  /*
   * Ro'yxatda KO'RINADIGAN rasm — yuklangani, saytdagi kabi.
   * Formaga esa XOM yo'l boradi: aks holda saqlashda kontentga
   * `/media/...` tushib qolardi va keyingi yuklash uni topa olmasdi.
   */
  const previews = Object.fromEntries(
    items.map((p) => {
      const raw = p.images[0]?.src ?? "";
      const hit = overrides[raw];
      return [p._id, (typeof hit === "string" ? hit : hit?.url) ?? raw];
    }),
  );

  return (
    <AdminShell
      active="products"
      title="Mahsulotlar"
      description="Katalogdagi mahsulotlar. Har bir matn uchala tilda to‘ldiriladi — sayt ru, uz va en da ishlaydi."
    >
      <ProductsAdmin
        items={items}
        categories={categories}
        badges={badges}
        previews={previews}
      />
    </AdminShell>
  );
}
