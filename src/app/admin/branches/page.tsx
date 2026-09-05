import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { BranchesAdmin } from "./BranchesAdmin";
import { readCollection } from "@/lib/store";
import { branches as seedBranches } from "@/content/branches";
import type { Branch } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<Branch>("branches", seedBranches);
  return (
    <AdminShell
      active="branches"
      title="Filiallar"
      description="Xaritadagi nuqtalar, «Магазины» sahifasi va footerdagi manzillar shu ro‘yxatdan olinadi."
    >
      <BranchesAdmin items={items} />
    </AdminShell>
  );
}
