import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { TimelineAdmin } from "./TimelineAdmin";
import { readCollection } from "@/lib/store";
import { timeline as seedTimeline } from "@/content/timeline";
import type { TimelinePoint } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<TimelinePoint>("timeline", seedTimeline);
  return (
    <AdminShell
      active="timeline"
      title="Tarix"
      description="«Kompaniya haqida» sahifasidagi yillar chizig‘i. Har yil uchun sarlavha, matn va rasm."
    >
      <TimelineAdmin items={items} />
    </AdminShell>
  );
}
