"use client";

import { useEffect, useState } from "react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Array<{ id: string; code: string; discountType: string; discountValue: string; isActive: boolean }>>([]);
  const [form, setForm] = useState({ code: "WELCOME10", discountType: "PERCENTAGE", discountValue: "10", minOrder: "299", maxDiscount: "100" });

  async function load() {
    setCoupons((await (await fetch("/api/admin/coupons")).json()).coupons ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountValue: Number(form.discountValue),
        minOrder: Number(form.minOrder),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-brick">Coupons</h1>
      <form onSubmit={create} className="mt-4 grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-5">
        <input className="rounded-xl border p-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="rounded-xl border p-2" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
          <option>PERCENTAGE</option>
          <option>FIXED</option>
        </select>
        <input className="rounded-xl border p-2" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="Value" />
        <input className="rounded-xl border p-2" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="Min order" />
        <button className="rounded-full bg-brick text-cream">Create</button>
      </form>
      <ul className="mt-6 space-y-2">
        {coupons.map((c) => (
          <li key={c.id} className="flex justify-between rounded-2xl bg-white p-4">
            <span>{c.code} · {c.discountType} {c.discountValue}</span>
            <span>{c.isActive ? "Active" : "Off"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
