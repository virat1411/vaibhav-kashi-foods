"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { ASSETS } from "@/lib/assets";
import { SITE } from "@/lib/site";
import { useCartCount } from "./providers";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCartCount();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/menu?q=${encodeURIComponent(query)}` : "/menu");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(107,45,26,0.12)] bg-[rgba(251,246,238,0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded-full">
          <Image src={ASSETS.logo} alt="Vaibhav Kashi Foods" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-1 ring-saffron/40" />
          <span className="leading-tight">
            <span className="font-display block text-lg text-brick">Vaibhav Kashi</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-muted">Foods · Varanasi</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm tracking-wide ${pathname === item.href ? "text-brick" : "text-ink/75 hover:text-brick"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <form onSubmit={search} className="hidden items-center rounded-full border border-brick/15 bg-white/70 px-3 py-1.5 md:flex">
            <Search className="h-4 w-4 text-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search paneer, thali..."
              className="w-44 bg-transparent px-2 text-sm outline-none"
              aria-label="Search menu"
            />
          </form>
          <Link href="/account" className="focus-ring rounded-full p-2 text-ink/80 hover:bg-brick/5" aria-label="Account">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="focus-ring relative rounded-full p-2 text-ink/80 hover:bg-brick/5" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-brick px-1 text-[10px] text-cream">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="focus-ring rounded-full p-2 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brick/10 bg-paper px-4 py-4 lg:hidden">
          <form onSubmit={search} className="mb-3 flex items-center rounded-full border border-brick/15 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the menu"
              className="w-full bg-transparent px-2 text-sm outline-none"
              aria-label="Search menu"
            />
          </form>
          <nav className="grid gap-2" aria-label="Mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-brick/5">
                {item.label}
              </Link>
            ))}
            <p className="px-3 pt-2 text-xs text-muted">{SITE.address.formatted}</p>
          </nav>
        </div>
      )}
    </header>
  );
}
