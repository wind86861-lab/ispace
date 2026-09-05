import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { FaqAdmin } from "./FaqAdmin";
import { readCollection } from "@/lib/store";
import { faq as seedFaq } from "@/content/faq";
import type { FaqItem } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<FaqItem>("faq", seedFaq);
  return (
    <AdminShell
      active="faq"
      title="Savol-javob"
      description="Bosh sahifa, katalog va filiallar sahifasidagi «Часто задаваемые вопросы» bloki."
    >
      <FaqAdmin items={items} />
    </AdminShell>
  );
}
