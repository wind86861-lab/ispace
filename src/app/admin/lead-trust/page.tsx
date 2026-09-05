import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { LeadTrustAdmin } from "./LeadTrustAdmin";
import { readCollection } from "@/lib/store";
import { leadTrust as seedLeadTrust } from "@/content/lead-trust";
import type { TrustPoint } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<TrustPoint>("leadTrust", seedLeadTrust);
  return (
    <AdminShell
      active="lead-trust"
      title="Ishonch chizig‘i"
      description="«Не нашли нужный товар?» formasi ostidagi qator — kafolat, yetkazib berish, qo‘llab-quvvatlash."
    >
      <LeadTrustAdmin items={items} />
    </AdminShell>
  );
}
