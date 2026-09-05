"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Lock, User } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Kirib bo‘lmadi");
        setBusy(false);
        return;
      }

      setPassword("");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Serverga ulanib bo‘lmadi");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-taupe/30 bg-warm-white p-8"
      >
        <p className="text-lg font-semibold tracking-tight text-espresso">
          i<span className="text-gold-deep">Space</span> — admin
        </p>
        <p className="mt-1 mb-6 text-[13px] text-espresso-soft">
          Davom etish uchun login va parolni kiriting.
        </p>

        <label className="relative mb-3 block">
          <span className="sr-only">Login</span>
          <User
            size={15}
            strokeWidth={1.6}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-taupe-text"
          />
          <input
            type="text"
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            placeholder="Login"
            className={[
              "h-12 w-full rounded-xl border bg-cream pr-4 pl-11 text-sm text-espresso outline-none",
              "transition-colors duration-300",
              error ? "border-red-400 focus:border-red-500" : "border-taupe/45 focus:border-gold",
            ].join(" ")}
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Parol</span>
          <Lock
            size={15}
            strokeWidth={1.6}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-taupe-text"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "login-error" : undefined}
            placeholder="Parol"
            className={[
              "h-12 w-full rounded-xl border bg-cream pr-4 pl-11 text-sm text-espresso outline-none",
              "transition-colors duration-300",
              error ? "border-red-400 focus:border-red-500" : "border-taupe/45 focus:border-gold",
            ].join(" ")}
          />
        </label>

        {error && (
          <p id="login-error" role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || username.length === 0 || password.length === 0}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold-deep text-sm font-medium text-warm-white transition-colors duration-300 hover:bg-gold-hover disabled:opacity-50"
        >
          {busy && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
          {busy ? "Tekshirilmoqda" : "Kirish"}
        </button>

        <p className="mt-5 text-[11px] leading-relaxed text-espresso-soft/85">
          Login <code className="font-mono">ADMIN_USERNAME</code> (berilmasa —
          <code className="font-mono">admin</code>), parol esa{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> muhit
          o‘zgaruvchisida saqlanadi. Besh marta xato kiritilsa, kirish 15
          daqiqaga bloklanadi.
        </p>
      </form>
    </div>
  );
}
