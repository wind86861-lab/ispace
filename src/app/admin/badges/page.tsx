import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { BadgesAdmin } from "./BadgesAdmin";
import { readCollection } from "@/lib/store";
import { badges as seedBadges } from "@/content/badges";
import type { Badge } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<Badge>("badges", seedBadges);
  return (
    <AdminShell
      active="badges"
      title="Belgilar"
      description="Karta rasmidagi nishonlar — «4D», «ZERO», «SL». Ikoni shu yerda yuklanadi, mahsulotga esa «Mahsulotlar» bo‘limida biriktiriladi."
    >
      <BadgesAdmin items={items} />
    </AdminShell>
  );
}
