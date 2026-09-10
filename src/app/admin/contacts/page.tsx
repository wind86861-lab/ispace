import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { ContactsAdmin } from "./ContactsAdmin";
import { readCollection } from "@/lib/store";
import { contact as seedContact } from "@/content/nav";
import type { SiteContact } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const items = await readCollection<SiteContact>("contact", [seedContact]);
  return (
    <AdminShell
      active="contacts"
      title="Kontaktlar"
      description="Telefon, e-mail va ijtimoiy tarmoqlar. Shu yerda «Telegram orqali bog‘lanish» havolasi ham qo‘yiladi — u mahsulot sahifalarida ishlatiladi."
    >
      <ContactsAdmin value={items[0] ?? seedContact} />
    </AdminShell>
  );
}
