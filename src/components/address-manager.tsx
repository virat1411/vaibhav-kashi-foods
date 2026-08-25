"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Address = {
  id: string;
  type: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  pincode: string;
};

export function AddressManager({ initial }: { initial: Address[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "Varanasi",
    pincode: "",
    type: "HOME",
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6">
      {initial.map((a) => (
        <div key={a.id} className="flex items-start justify-between rounded-2xl bg-white p-4">
          <div>
            <p className="text-xs uppercase text-saffron">{a.type}</p>
            <p>{a.name} · {a.phone}</p>
            <p className="text-sm text-muted">{a.line1}, {a.city} {a.pincode}</p>
          </div>
          <button onClick={() => remove(a.id)} className="text-xs text-muted">Remove</button>
        </div>
      ))}
      <form onSubmit={save} className="grid gap-3 rounded-3xl bg-white p-5">
        <p className="font-medium">Add address</p>
        <input required placeholder="Name" className="rounded-xl border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Phone" className="rounded-xl border p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required placeholder="Address" className="rounded-xl border p-2" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
        <input required placeholder="Pincode" className="rounded-xl border p-2" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        <select className="rounded-xl border p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option>HOME</option>
          <option>WORK</option>
          <option>OTHER</option>
        </select>
        <button className="rounded-full bg-brick py-2 text-cream">Save</button>
      </form>
    </div>
  );
}
