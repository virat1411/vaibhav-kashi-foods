"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatInr } from "@/lib/site";
import { useCartCount } from "@/components/providers";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { refresh } = useCartCount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Array<Record<string, string>>>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    line1: "",
    house: "",
    landmark: "",
    city: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221011",
    type: "HOME",
    paymentMethod: "COD",
    notes: "",
    saveAddress: true,
  });

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) => (r.ok ? r.json() : { addresses: [] }))
      .then((d) => setAddresses(d.addresses ?? []))
      .catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function place(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            line1: form.line1,
            house: form.house,
            landmark: form.landmark,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            type: form.type,
          },
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          saveAddress: form.saveAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order.");
        return;
      }
      await refresh();

      if (data.payment?.method === "RAZORPAY") {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Razorpay failed to load"));
          document.body.appendChild(script);
        });
        const key = data.payment.keyId;
        if (!key || !window.Razorpay) {
          setError("Online payment is not configured yet. Please use Cash on Delivery.");
          return;
        }
        await new Promise<void>((resolve) => {
          const rzp = new window.Razorpay!({
            key,
            amount: data.payment.amount,
            currency: data.payment.currency,
            name: "Vaibhav Kashi Foods",
            order_id: data.payment.razorpayOrderId,
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              const verify = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: data.order.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              if (!verify.ok) {
                setError("Payment could not be completed. Please try again.");
                resolve();
                return;
              }
              router.push(`/order/${data.order.orderNumber}`);
              resolve();
            },
            modal: { ondismiss: () => resolve() },
          });
          rzp.open();
        });
        return;
      }

      router.push(`/order/${data.order.orderNumber}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-brick">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Totals are calculated on the server from current menu prices.</p>
      {error && <p className="mt-4 rounded-2xl bg-brick/10 p-3 text-sm text-brick">{error}</p>}
      <form onSubmit={place} className="mt-6 grid gap-4">
        {addresses.length > 0 && (
          <label className="text-sm">
            Saved address
            <select
              className="mt-1 w-full rounded-2xl border border-brick/15 bg-white p-3"
              onChange={(e) => {
                const a = addresses.find((x) => x.id === e.target.value);
                if (!a) return;
                setForm((f) => ({
                  ...f,
                  name: a.name,
                  phone: a.phone,
                  line1: a.line1,
                  house: a.house ?? "",
                  landmark: a.landmark ?? "",
                  city: a.city,
                  pincode: a.pincode,
                }));
              }}
            >
              <option value="">Choose…</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.type} · {a.line1}
                </option>
              ))}
            </select>
          </label>
        )}
        <input required placeholder="Name" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input required placeholder="Mobile" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <input placeholder="Email (optional)" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input required placeholder="Address" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.line1} onChange={(e) => set("line1", e.target.value)} />
        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="House / flat" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.house} onChange={(e) => set("house", e.target.value)} />
          <input placeholder="Landmark" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input required placeholder="City" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.city} onChange={(e) => set("city", e.target.value)} />
          <input required placeholder="Pincode" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
          <select className="rounded-2xl border border-brick/15 bg-white p-3" value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <textarea placeholder="Delivery notes" className="rounded-2xl border border-brick/15 bg-white p-3" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <fieldset className="rounded-2xl bg-white p-4">
          <legend className="text-sm font-medium">Payment</legend>
          <label className="mt-2 flex gap-2 text-sm">
            <input type="radio" checked={form.paymentMethod === "COD"} onChange={() => set("paymentMethod", "COD")} />
            Cash on Delivery
          </label>
          <label className="mt-2 flex gap-2 text-sm">
            <input type="radio" checked={form.paymentMethod === "RAZORPAY"} onChange={() => set("paymentMethod", "RAZORPAY")} />
            Pay online (Razorpay)
          </label>
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.saveAddress} onChange={(e) => set("saveAddress", e.target.checked)} />
          Save this address
        </label>
        <button disabled={busy} className="rounded-full bg-brick py-3 text-cream disabled:opacity-60">
          {busy ? "Placing order…" : "Place order"}
        </button>
        <p className="text-center text-xs text-muted">{formatInr(null)} items cannot be checked out until prices are set in admin.</p>
      </form>
    </div>
  );
}
