"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not register.");
      setBusy(false);
      return;
    }
    router.push("/account");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl text-brick">Create account</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <input required placeholder="Name" className="rounded-2xl border p-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" required placeholder="Email" className="rounded-2xl border p-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" className="rounded-2xl border p-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input type="password" required minLength={8} placeholder="Password (8+ characters)" className="rounded-2xl border p-3" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-brick">{error}</p>}
        <button disabled={busy} className="rounded-full bg-brick py-3 text-cream">{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link href="/login" className="text-brick">Login</Link></p>
    </div>
  );
}
