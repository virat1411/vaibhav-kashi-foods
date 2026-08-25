"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

type Order = {
  id: string;
  orderNumber: string;
  guestName: string | null;
  guestPhone: string | null;
  total: string;
  status: string;
  createdAt: string;
  items: { nameSnapshot: string; quantity: number }[];
  payments: { status: string; method: string }[];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [range, setRange] = useState("today");
  const [q, setQ] = useState("");

  async function load() {
    const params = new URLSearchParams({ range });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
  }

  useEffect(() => {
    load();
  }, [status, range]);

  async function move(id: string, next: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-brick">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {["today", "yesterday", "week", "month", "all"].map((r) => (
          <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 text-sm ${range === r ? "bg-brick text-cream" : "bg-white"}`}>{r}</button>
        ))}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full bg-white px-3 py-1 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} onBlur={load} placeholder="Search order / phone" className="rounded-full bg-white px-3 py-1 text-sm" />
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-muted">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Pay</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-brick/5">
                <td className="p-3"><Link href={`/order/${o.orderNumber}`} className="text-brick">{o.orderNumber}</Link></td>
                <td className="p-3">{o.guestName}<br /><span className="text-xs text-muted">{o.guestPhone}</span></td>
                <td className="p-3">{o.items.map((i) => `${i.nameSnapshot}×${i.quantity}`).join(", ")}</td>
                <td className="p-3">₹{Number(o.total).toFixed(0)}</td>
                <td className="p-3">{o.payments[0]?.method} {o.payments[0]?.status}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">
                  <select className="rounded-lg border p-1" defaultValue="" onChange={(e) => e.target.value && move(o.id, e.target.value)}>
                    <option value="">Update…</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
