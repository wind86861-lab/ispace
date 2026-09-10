import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { OrdersAdmin } from "./OrdersAdmin";
import { readOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readOrders();
  return (
    <AdminShell
      active="orders"
      title="Buyurtmalar"
      description="Saytdan kelgan buyurtma va murojaatlar. Yangilari tepada; raqamni bosib darrov qo‘ng‘iroq qilish mumkin."
    >
      <OrdersAdmin items={items} />
    </AdminShell>
  );
}
