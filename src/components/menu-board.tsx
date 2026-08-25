"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FoodCard, MenuCardItem } from "./food-card";
import { StickyCart } from "./sticky-cart";

type Category = { id: string; name: string; slug: string };

export function MenuBoard({
  categories,
  items,
  activeSlug,
  query,
}: {
  categories: Category[];
  items: MenuCardItem[];
  activeSlug?: string;
  query: { q?: string; vegetarian?: string; popular?: string; spicy?: string; sort?: string };
}) {
  const router = useRouter();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(query as Record<string, string>);
    if (!value || value === "0") params.delete(key);
    else params.set(key, value);
    router.push(`/menu?${params.toString()}`);
  }

  const grouped = activeSlug
    ? [{ slug: activeSlug, name: categories.find((c) => c.slug === activeSlug)?.name ?? "", items }]
    : categories.map((c) => ({ slug: c.slug, name: c.name, items: items.filter((i) => i.category?.slug === c.slug) })).filter((g) => g.items.length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-saffron">Kitchen menu</p>
          <h1 className="font-display text-4xl text-brick">Order from Vaibhav Kashi Foods</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={() => setParam("vegetarian", query.vegetarian === "1" ? "" : "1")} className={`rounded-full px-3 py-1 ${query.vegetarian === "1" ? "bg-leaf text-white" : "bg-white"}`}>Vegetarian</button>
          <button onClick={() => setParam("popular", query.popular === "1" ? "" : "1")} className={`rounded-full px-3 py-1 ${query.popular === "1" ? "bg-brick text-cream" : "bg-white"}`}>Popular</button>
          <button onClick={() => setParam("spicy", query.spicy === "1" ? "" : "1")} className={`rounded-full px-3 py-1 ${query.spicy === "1" ? "bg-brick text-cream" : "bg-white"}`}>Spicy</button>
          <select
            className="rounded-full bg-white px-3 py-1"
            value={query.sort ?? "recommended"}
            onChange={(e) => setParam("sort", e.target.value)}
            aria-label="Sort"
          >
            <option value="recommended">Recommended</option>
            <option value="popular">Popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/menu/${c.slug}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${activeSlug === c.slug ? "bg-brick text-cream" : "bg-white"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[200px_1fr_300px]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 grid gap-1" aria-label="Categories">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/menu/${c.slug}`}
                className={`rounded-xl px-3 py-2 text-sm ${activeSlug === c.slug ? "bg-brick text-cream" : "hover:bg-white"}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="space-y-12">
          {grouped.length === 0 && <p className="text-muted">No dishes match this search.</p>}
          {grouped.map((group) => (
            <section key={group.slug} id={group.slug}>
              <h2 className="font-display text-3xl text-brick">{group.name}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <StickyCart />
      </div>
    </div>
  );
}
