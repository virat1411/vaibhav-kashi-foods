"use client";

import { useEffect, useState } from "react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string; phone: string | null; _count: { orders: number } }>>([]);
  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, []);
  return (
    <div>
      <h1 className="font-display text-4xl text-brick">Customers</h1>
      <ul className="mt-6 space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4">
            <p>{c.name} · {c.email}</p>
            <p className="text-sm text-muted">{c.phone ?? "No phone"} · {c._count.orders} orders</p>
          </li>
        ))}
        {customers.length === 0 && <p className="text-muted">No customer accounts yet.</p>}
      </ul>
    </div>
  );
}
