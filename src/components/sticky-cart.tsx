"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/site";
import { useCartCount } from "./providers";

type Cart = {
  couponCode?: string | null;
  items: {
    id: string;
    quantity: number;
    menuItem: { name: string; price: string | number | null };
  }[];
};

export function StickyCart() {
  const { refresh } = useCartCount();
  const [cart, setCart] = useState<Cart | null>(null);

  async function load() {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCart(data.cart);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const subtotal = (cart?.items ?? []).reduce((sum, item) => {
    const price = item.menuItem.price === null ? 0 : Number(item.menuItem.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-[1.6rem] border border-brick/10 bg-white/90 p-5">
        <h2 className="font-display text-2xl text-brick">Your thali tray</h2>
        <div className="mt-4 space-y-3">
          {(cart?.items ?? []).length === 0 && <p className="text-sm text-muted">Your cart is empty.</p>}
          {(cart?.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.menuItem.name} × {item.quantity}
              </span>
              <span>{formatInr(item.menuItem.price === null ? null : Number(item.menuItem.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-brick/10 pt-3 text-sm">
          <span>Subtotal</span>
          <span>{formatInr(subtotal)}</span>
        </div>
        <Link href="/cart" className="mt-4 block rounded-full bg-brick py-2 text-center text-sm text-cream">
          View cart
        </Link>
        <button type="button" className="mt-2 w-full text-xs text-muted" onClick={() => { load(); refresh(); }}>
          Refresh
        </button>
      </div>
    </aside>
  );
}
