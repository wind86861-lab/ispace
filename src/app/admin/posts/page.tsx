import { requireAdmin } from "../guard";
import { AdminShell } from "../AdminShell";
import { PostsAdmin } from "./PostsAdmin";
import { readCollection } from "@/lib/store";
import { readOverrides } from "@/lib/image-overrides";
import { posts as seedPosts } from "@/content/posts";
import type { Post } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  const [items, overrides] = await Promise.all([
    readCollection<Post>("posts", seedPosts),
    readOverrides(),
  ]);

  // Ro'yxatda yuklangan muqova ko'rinadi; formaga xom yo'l boradi.
  const previews = Object.fromEntries(
    items.map((p) => {
      const raw = p.cover.src;
      const hit = overrides[raw];
      return [p._id, (typeof hit === "string" ? hit : hit?.url) ?? raw];
    }),
  );

  return (
    <AdminShell
      active="posts"
      title="Maqolalar"
      description="Blog maqolalari. Matn bloklardan yig‘iladi — xatboshi, sarlavha, ro‘yxat, iqtibos va rasm; har biri uchala tilda."
    >
      <PostsAdmin items={items} previews={previews} />
    </AdminShell>
  );
}
