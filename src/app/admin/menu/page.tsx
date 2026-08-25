"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  price: string | null;
  availability: string;
  isPopular: boolean;
  isBestseller: boolean;
  isRecommended: boolean;
  category: { name: string };
};

export default function AdminMenu() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({ name: "", categoryId: "", price: "", description: "" });

  async function load() {
    const [m, c] = await Promise.all([fetch("/api/admin/menu"), fetch("/api/admin/categories")]);
    setItems((await m.json()).items ?? []);
    setCategories((await c.json()).categories ?? []);
  }
  useEffect(() => { load(); }, []);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/admin/menu/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        price: form.price === "" ? null : Number(form.price),
      }),
    });
    setForm({ name: "", categoryId: form.categoryId, price: "", description: "" });
    load();
  }

  async function upload(id: string, file: File) {
    const data = new FormData();
    data.set("file", file);
    const up = await fetch("/api/admin/upload", { method: "POST", body: data });
    const { url } = await up.json();
    await fetch(`/api/admin/menu/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt: "Menu item photo", isPrimary: true }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-brick">Menu</h1>
      <form onSubmit={create} className="mt-4 grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-5">
        <input required placeholder="Item name" className="rounded-xl border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select required className="rounded-xl border p-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Price (blank = unset)" className="rounded-xl border p-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Description" className="rounded-xl border p-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="rounded-full bg-brick text-cream">Add item</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-muted"><th className="p-3">Item</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Flags</th><th className="p-3">Image</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-brick/5">
                <td className="p-3">{item.name}<div className="text-xs text-muted">{item.category.name}</div></td>
                <td className="p-3">
                  <input
                    defaultValue={item.price ?? ""}
                    className="w-24 rounded border p-1"
                    onBlur={(e) => patch(item.id, { price: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </td>
                <td className="p-3">
                  <select value={item.availability} onChange={(e) => patch(item.id, { availability: e.target.value })} className="rounded border p-1">
                    <option>AVAILABLE</option>
                    <option>OUT_OF_STOCK</option>
                    <option>HIDDEN</option>
                  </select>
                </td>
                <td className="p-3 space-x-2">
                  <label><input type="checkbox" checked={item.isPopular} onChange={(e) => patch(item.id, { isPopular: e.target.checked })} /> Popular</label>
                  <label><input type="checkbox" checked={item.isBestseller} onChange={(e) => patch(item.id, { isBestseller: e.target.checked })} /> Bestseller</label>
                  <label><input type="checkbox" checked={item.isRecommended} onChange={(e) => patch(item.id, { isRecommended: e.target.checked })} /> Recommended</label>
                </td>
                <td className="p-3">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(item.id, e.target.files[0])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
