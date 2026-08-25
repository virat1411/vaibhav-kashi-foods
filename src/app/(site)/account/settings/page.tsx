"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setMessage(res.ok ? "Password updated." : "Could not update password.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-4xl text-brick">Account settings</h1>
      <form onSubmit={save} className="mt-6 grid gap-3">
        <input type="password" required minLength={8} placeholder="New password" className="rounded-2xl border p-3" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="rounded-full bg-brick py-3 text-cream">Update password</button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}
