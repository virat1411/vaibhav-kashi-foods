"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState<{
    today: { orders: number; revenue: number; pending: number; preparing: number; delivered: number; cancelled: number };
    recent: Array<{ id: string; orderNumber: string; total: string; status: string; guestName: string | null }>;
    topItems: Array<{ nameSnapshot: string; _sum: { quantity: number | null } }>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data?.today) return <p>Loading dashboard…</p>;
  const t = data.today;

  return (
    <div>
      <h1 className="font-display text-4xl text-brick">Kitchen board</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Today's orders", t.orders],
          ["Revenue", `₹${Number(t.revenue).toFixed(0)}`],
          ["Pending", t.pending],
          ["Preparing", t.preparing],
          ["Delivered", t.delivered],
          ["Cancelled", t.cancelled],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
            <p className="font-display mt-1 text-3xl text-brick">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.recent.map((o) => (
              <li key={o.id} className="flex justify-between">
                <span>{o.orderNumber} · {o.guestName}</span>
                <span>{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Top items</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.topItems.map((item) => (
              <li key={item.nameSnapshot} className="flex justify-between">
                <span>{item.nameSnapshot}</span>
                <span>{item._sum.quantity ?? 0}</span>
              </li>
            ))}
            {data.topItems.length === 0 && <li className="text-muted">No sales yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
