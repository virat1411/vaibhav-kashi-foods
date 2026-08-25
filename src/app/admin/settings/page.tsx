"use client";

import { useEffect, useState } from "react";

export default function AdminSettings() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [pincodes, setPincodes] = useState("221011");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings ?? {};
        setForm({
          name: s.name ?? "",
          phone: s.phone ?? "",
          email: s.email ?? "",
          addressLine1: s.addressLine1 ?? "",
          city: s.city ?? "",
          pincode: s.pincode ?? "",
          openStatus: s.openStatus ?? "OPEN",
          deliveryFee: String(s.deliveryFee ?? 0),
          minOrder: String(s.minOrder ?? 0),
          freeDeliveryThreshold: s.freeDeliveryThreshold ?? "",
          taxPercent: String(s.taxPercent ?? 0),
          estimatedDeliveryMinutes: String(s.estimatedDeliveryMinutes ?? 45),
          whatsappNumber: s.whatsappNumber ?? "",
          instagramUrl: s.instagramUrl ?? "",
          whatsappOrderingEnabled: s.whatsappOrderingEnabled ? "1" : "0",
        });
        setPincodes((d.zones?.[0]?.pincodes ?? ["221011"]).join(","));
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        email: form.email || null,
        deliveryFee: Number(form.deliveryFee),
        minOrder: Number(form.minOrder),
        freeDeliveryThreshold: form.freeDeliveryThreshold === "" ? null : Number(form.freeDeliveryThreshold),
        taxPercent: Number(form.taxPercent),
        estimatedDeliveryMinutes: Number(form.estimatedDeliveryMinutes),
        whatsappOrderingEnabled: form.whatsappOrderingEnabled === "1",
        pincodes: pincodes.split(",").map((p) => p.trim()).filter(Boolean),
      }),
    });
    setMessage(res.ok ? "Saved." : "Could not save.");
  }

  return (
    <form onSubmit={save} className="grid max-w-2xl gap-3">
      <h1 className="font-display text-4xl text-brick">Restaurant settings</h1>
      {["name", "phone", "email", "addressLine1", "city", "pincode", "deliveryFee", "minOrder", "freeDeliveryThreshold", "taxPercent", "estimatedDeliveryMinutes", "whatsappNumber", "instagramUrl"].map((key) => (
        <label key={key} className="text-sm capitalize">
          {key}
          <input className="mt-1 w-full rounded-xl border bg-white p-2" value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </label>
      ))}
      <label className="text-sm">
        Open / closed
        <select className="mt-1 w-full rounded-xl border p-2" value={form.openStatus} onChange={(e) => setForm({ ...form, openStatus: e.target.value })}>
          <option>OPEN</option>
          <option>CLOSED</option>
        </select>
      </label>
      <label className="text-sm">
        Serviceable pincodes (comma separated)
        <input className="mt-1 w-full rounded-xl border p-2" value={pincodes} onChange={(e) => setPincodes(e.target.value)} />
      </label>
      <label className="text-sm">
        WhatsApp ordering
        <select className="mt-1 w-full rounded-xl border p-2" value={form.whatsappOrderingEnabled} onChange={(e) => setForm({ ...form, whatsappOrderingEnabled: e.target.value })}>
          <option value="1">Enabled</option>
          <option value="0">Disabled</option>
        </select>
      </label>
      <button className="rounded-full bg-brick py-3 text-cream">Save settings</button>
      {message && <p>{message}</p>}
    </form>
  );
}
