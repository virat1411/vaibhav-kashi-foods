"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/site";
import { useCartCount } from "@/components/providers";

type CartItem = {
  id: string;
  quantity: number;
  specialInstructions?: string | null;
  menuItem: { name: string; price: string | number | null; availability: string };
};

export default function CartPage() {
  const { refresh } = useCartCount();
  const [cart, setCart] = useState<{ items: CartItem[]; couponCode?: string | null } | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(data.cart);
    await refresh();
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, quantity: number) {
    await fetch(`/api/cart/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
    load();
  }

  async function applyCoupon() {
    setMessage("");
    const res = await fetch("/api/cart/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error ?? "Coupon could not be applied.");
    else setMessage(`Coupon ${data.coupon.code} applied.`);
    load();
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.menuItem.price ?? 0) * item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-brick">Cart</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link href="/menu" className="mt-4 inline-block rounded-full bg-brick px-5 py-2 text-cream">
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
              <div>
                <p className="font-medium">{item.menuItem.name}</p>
                {item.specialInstructions && <p className="text-xs text-muted">{item.specialInstructions}</p>}
                <p className="text-sm text-brick">{formatInr(item.menuItem.price === null ? null : Number(item.menuItem.price))}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => patch(item.id, Math.max(1, item.quantity - 1))} className="h-8 w-8 rounded-full border">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => patch(item.id, item.quantity + 1)} className="h-8 w-8 rounded-full border">+</button>
                <button onClick={() => remove(item.id)} className="ml-2 text-xs text-muted">Remove</button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="flex-1 rounded-full border border-brick/15 bg-white px-4 py-2" />
            <button onClick={applyCoupon} className="rounded-full bg-brick px-4 py-2 text-cream">Apply coupon</button>
          </div>
          {message && <p className="text-sm text-brick">{message}</p>}
          {cart?.couponCode && <p className="text-sm">Coupon on cart: {cart.couponCode}</p>}
          <div className="flex justify-between border-t border-brick/10 pt-4">
            <span>Subtotal</span>
            <span>{formatInr(subtotal)}</span>
          </div>
          <p className="text-xs text-muted">Delivery, tax and discounts are calculated at checkout from restaurant settings — not from this screen.</p>
          <div className="flex gap-3">
            <button onClick={async () => { await fetch("/api/cart", { method: "DELETE" }); load(); }} className="rounded-full border px-4 py-2 text-sm">
              Clear cart
            </button>
            <Link href="/checkout" className="rounded-full bg-brick px-5 py-2 text-cream">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
