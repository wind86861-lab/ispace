import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { AdminImages } from "../AdminImages";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  return (
    <AdminShell
      active="images"
      title="Rasmlar"
      description="Saytning qat‘iy joylaridagi rasmlar: hero, «О компании», hamkorlar, brend belgilari va mahsulot sahifalarining hikoya bloklari. Mahsulot, kategoriya, maqola va filial rasmlari bu yerda EMAS — ular o‘z bo‘limlarida, yozuvni tahrirlaganda yuklanadi."
    >
      <AdminImages />
    </AdminShell>
  );
}
