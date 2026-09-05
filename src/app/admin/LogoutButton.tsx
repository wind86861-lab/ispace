"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/admin/session", {
            method: "DELETE",
            headers: { "x-requested-with": "ispace-admin" },
          });
          router.replace("/admin/login");
          router.refresh();
        })
      }
      className="inline-flex items-center gap-2 rounded-xl border border-taupe/40 px-3.5 py-2 text-[13px] text-espresso-soft transition-colors duration-300 hover:border-gold/50 hover:text-espresso disabled:opacity-50"
    >
      <LogOut size={15} strokeWidth={1.6} aria-hidden="true" />
      Chiqish
    </button>
  );
}
