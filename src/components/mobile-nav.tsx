"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useCartCount } from "./providers";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/menu", label: "Menu", icon: Search },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { count } = useCartCount();
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brick/10 bg-[rgba(251,246,238,0.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Mobile"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] ${active ? "text-brick" : "text-muted"}`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {item.href === "/account/orders" && count > 0 ? null : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
