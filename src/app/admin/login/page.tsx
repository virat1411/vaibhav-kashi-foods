"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }
    if (!["ADMIN", "STAFF", "DELIVERY"].includes(data.user.role)) {
      setError("This account is not staff.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="mx-auto max-w-md py-20">
      <h1 className="font-display text-4xl text-brick">Staff login</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <input type="email" required className="rounded-2xl border p-3" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required className="rounded-2xl border p-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-brick">{error}</p>}
        <button className="rounded-full bg-brick py-3 text-cream">Enter kitchen</button>
      </form>
    </div>
  );
}
