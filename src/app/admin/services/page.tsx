import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { ServicesAdmin } from "./ServicesAdmin";
import { readCollection } from "@/lib/store";
import { services as seedServices } from "@/content/services";
import type { ClientService } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<ClientService>("services", seedServices);
  return (
    <AdminShell
      active="services"
      title="Mijozlarga"
      description="«Mijozlarga» sahifasidagi bo‘limlar: test-drayv, muddatli to‘lov, kafolat, yetkazib berish. Har biriga rasm yoki video yuklanadi."
    >
      <ServicesAdmin items={items} />
    </AdminShell>
  );
}
