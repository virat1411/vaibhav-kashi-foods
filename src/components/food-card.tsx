"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { formatInr } from "@/lib/site";
import { itemImage } from "@/lib/assets";
import { useCartCount } from "./providers";
import { useState } from "react";

export type MenuCardItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | number | null;
  availability: "AVAILABLE" | "OUT_OF_STOCK" | "HIDDEN";
  isVegetarian: boolean;
  isPopular: boolean;
  isBestseller?: boolean;
  spiceLevel?: string;
  images?: { url: string; isPrimary?: boolean }[];
  category?: { imageKey?: string | null; slug?: string; name?: string };
};

export function FoodCard({ item }: { item: MenuCardItem }) {
  const { refresh } = useCartCount();
  const [busy, setBusy] = useState(false);
  const [fav, setFav] = useState(false);
  const unavailable = item.availability !== "AVAILABLE";
  const price = item.price === null ? null : Number(item.price);
  const image = itemImage(item);

  async function add() {
    if (unavailable || price === null) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Could not add to cart.");
        return;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleFav() {
    setFav((v) => !v);
    const method = fav ? "DELETE" : "POST";
    const url = fav ? `/api/favorites?menuItemId=${item.id}` : "/api/favorites";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ menuItemId: item.id }) : undefined,
    });
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-brick/10 bg-white/80 shadow-[0_12px_40px_rgba(28,20,16,0.06)]">
      <Link href={`/menu/item/${item.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex gap-1">
            {item.isVegetarian && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-leaf">Veg</span>
            )}
            {item.isPopular && (
              <span className="rounded-full bg-brick px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream">Popular</span>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={toggleFav}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-brick"
        aria-label="Save to favorites"
      >
        <Heart className={`h-4 w-4 ${fav ? "fill-brick" : ""}`} />
      </button>
      <div className="p-4">
        <Link href={`/menu/item/${item.slug}`}>
          <h3 className="font-display text-xl leading-tight">{item.name}</h3>
          {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>}
        </Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-brick">{formatInr(price)}</p>
          {unavailable ? (
            <span className="text-xs text-muted">Currently unavailable</span>
          ) : price === null ? (
            <span className="text-xs text-muted">Ask restaurant</span>
          ) : (
            <button
              type="button"
              onClick={add}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full bg-brick px-3 py-1.5 text-sm text-cream disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {busy ? "Adding" : "Add"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
