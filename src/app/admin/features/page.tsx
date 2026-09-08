import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { FeaturesAdmin } from "./FeaturesAdmin";
import { readCollection } from "@/lib/store";
import { productFeatures as seedFeatures } from "@/content/features";
import type { ProductFeature } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<ProductFeature>("productFeatures", seedFeatures);
  return (
    <AdminShell
      active="features"
      title="Xususiyatlar"
      description="Mahsulot xususiyatlari katalogi. Bu yerda bir marta yaratiladi, mahsulot formasida esa belgilanadi — shunda solishtirish jadvalidagi qatorlar mos tushadi."
    >
      <FeaturesAdmin items={items} />
    </AdminShell>
  );
}
