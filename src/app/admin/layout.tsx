import Link from "next/link";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#24140f] text-cream">
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-cream/10 p-6 md:block">
          <p className="font-display text-xl">VKF Kitchen</p>
          <nav className="mt-8 grid gap-2 text-sm">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-2 py-1.5 hover:bg-cream/10">
                {l.label}
              </Link>
            ))}
            <Link href="/" className="mt-8 text-gold">View site</Link>
          </nav>
        </aside>
        <div className="min-h-screen flex-1 bg-[#fbf6ee] text-ink">
          <div className="flex gap-3 overflow-x-auto border-b border-brick/10 bg-white px-4 py-3 md:hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm">{l.label}</Link>
            ))}
          </div>
          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
