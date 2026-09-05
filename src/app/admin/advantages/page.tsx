import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { AdvantagesAdmin } from "./AdvantagesAdmin";
import { readCollection } from "@/lib/store";
import { advantages as seedAdvantages } from "@/content/advantages";
import type { Advantage } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<Advantage>("advantages", seedAdvantages);
  return (
    <AdminShell
      active="advantages"
      title="Afzalliklar"
      description="«Почему выбирают iSpace?» bloki — bosh sahifada va «О компании» sahifasida."
    >
      <AdvantagesAdmin items={items} />
    </AdminShell>
  );
}
