"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed.");
      setBusy(false);
      return;
    }
    const next = params.get("next");
    if (data.user?.role === "ADMIN" || data.user?.role === "STAFF") {
      router.push(next || "/admin");
    } else {
      router.push(next || "/account");
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl text-brick">Login</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <input type="email" required placeholder="Email" className="rounded-2xl border p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className="rounded-2xl border p-3" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-brick">{error}</p>}
        <button disabled={busy} className="rounded-full bg-brick py-3 text-cream">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-4 text-sm">
        New here? <Link href="/register" className="text-brick">Create an account</Link>
      </p>
    </div>
  );
}
