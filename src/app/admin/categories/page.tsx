"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; sortOrder: number; isActive: boolean; imageKey: string };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const res = await fetch("/api/admin/categories");
    setCategories((await res.json()).categories ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, imageKey: "category.thali", sortOrder: categories.length * 10 }),
    });
    setName("");
    load();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-brick">Categories</h1>
      <form onSubmit={create} className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="rounded-full bg-white px-4 py-2" />
        <button className="rounded-full bg-brick px-4 py-2 text-cream">Add</button>
      </form>
      <ul className="mt-6 space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <div>
              <p>{c.name}</p>
              <p className="text-xs text-muted">/{c.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="number" defaultValue={c.sortOrder} className="w-20 rounded border p-1" onBlur={(e) => patch(c.id, { sortOrder: Number(e.target.value) })} />
              <label className="text-sm"><input type="checkbox" checked={c.isActive} onChange={(e) => patch(c.id, { isActive: e.target.checked })} /> Active</label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
