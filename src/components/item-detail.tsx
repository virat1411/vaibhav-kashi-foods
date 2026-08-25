"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { itemImage } from "@/lib/assets";
import { formatInr } from "@/lib/site";
import { useCartCount } from "./providers";

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  availability: "AVAILABLE" | "OUT_OF_STOCK" | "HIDDEN";
  isVegetarian: boolean;
  spiceLevel: string;
  prepTimeMinutes: number | null;
  category: { name: string; imageKey?: string | null };
  images: { url: string; isPrimary?: boolean }[];
  optionGroups: { id: string; name: string; required: boolean; options: { id: string; name: string; priceDelta: number }[] }[];
  addons: { id: string; name: string; price: number }[];
};

export function ItemDetail({ item }: { item: Item; restaurant: string }) {
  const router = useRouter();
  const { refresh } = useCartCount();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [options, setOptions] = useState<Record<string, string>>({});
  const [addons, setAddons] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const image = itemImage(item);
  const unavailable = item.availability !== "AVAILABLE";

  async function add() {
    if (unavailable || item.price === null) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: item.id,
          quantity: qty,
          specialInstructions: notes || undefined,
          selectedOptions: Object.entries(options).map(([groupId, optionId]) => ({ groupId, optionId })),
          selectedAddons: addons.map((addonId) => ({ addonId })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Could not add to cart.");
        return;
      }
      await refresh();
      router.push("/cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:px-6">
      <img src={image} alt={item.name} className="h-[420px] w-full rounded-[2rem] object-cover" />
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-saffron">{item.category.name}</p>
        <h1 className="font-display mt-2 text-5xl text-brick">{item.name}</h1>
        <p className="mt-3 text-muted">{item.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {item.isVegetarian && <span className="rounded-full bg-leaf/10 px-3 py-1 text-leaf">Vegetarian</span>}
          {item.spiceLevel !== "NONE" && <span className="rounded-full bg-brick/10 px-3 py-1">{item.spiceLevel.toLowerCase()} spice</span>}
          {item.prepTimeMinutes && <span className="rounded-full bg-white px-3 py-1">~{item.prepTimeMinutes} min</span>}
        </div>
        <p className="mt-6 font-display text-3xl text-brick">{formatInr(item.price)}</p>

        {item.optionGroups.map((group) => (
          <fieldset key={group.id} className="mt-6">
            <legend className="text-sm font-medium">{group.name}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((opt) => (
                <label key={opt.id} className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${options[group.id] === opt.id ? "border-brick bg-brick text-cream" : "border-brick/20"}`}>
                  <input
                    type="radio"
                    className="sr-only"
                    name={group.id}
                    checked={options[group.id] === opt.id}
                    onChange={() => setOptions((s) => ({ ...s, [group.id]: opt.id }))}
                  />
                  {opt.name}
                  {opt.priceDelta > 0 ? ` + ${formatInr(opt.priceDelta)}` : ""}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {item.addons.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Add-ons</legend>
            <div className="mt-2 space-y-2">
              {item.addons.map((addon) => (
                <label key={addon.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={addons.includes(addon.id)}
                    onChange={(e) =>
                      setAddons((list) => (e.target.checked ? [...list, addon.id] : list.filter((id) => id !== addon.id)))
                    }
                  />
                  {addon.name} {addon.price > 0 ? `(${formatInr(addon.price)})` : ""}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-6 block text-sm">
          Special instructions
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-2xl border border-brick/15 bg-white p-3" rows={3} />
        </label>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center rounded-full border border-brick/20">
            <button type="button" className="px-3 py-2" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">-</button>
            <span className="px-3">{qty}</span>
            <button type="button" className="px-3 py-2" onClick={() => setQty((n) => n + 1)} aria-label="Increase quantity">+</button>
          </div>
          {unavailable ? (
            <p className="text-sm text-muted">This item is currently unavailable.</p>
          ) : item.price === null ? (
            <p className="text-sm text-muted">Price is not set yet. Call the restaurant to order this dish.</p>
          ) : (
            <button type="button" onClick={add} disabled={busy} className="rounded-full bg-brick px-6 py-3 text-cream disabled:opacity-60">
              {busy ? "Adding…" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
