import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const orders = await prisma.order.count({ where: { userId: session.id } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-brick">Account</h1>
      <p className="mt-2 text-muted">{user?.name} · {user?.email}</p>
      {user?.mustChangePassword && (
        <p className="mt-4 rounded-2xl bg-gold/20 p-3 text-sm">Please change the default password in settings.</p>
      )}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/account/orders" className="rounded-3xl bg-white p-5">My orders ({orders})</Link>
        <Link href="/account/addresses" className="rounded-3xl bg-white p-5">Saved addresses</Link>
        <Link href="/favorites" className="rounded-3xl bg-white p-5">Favorites</Link>
        <Link href="/account/settings" className="rounded-3xl bg-white p-5">Account settings</Link>
      </div>
      <form action="/api/auth/logout" method="post" className="mt-8">
        <LogoutButton />
      </form>
    </div>
  );
}

function LogoutButton() {
  return (
    <button
      formAction={async () => {
        "use server";
        const { clearSession } = await import("@/lib/auth");
        await clearSession();
        redirect("/");
      }}
      className="text-sm text-muted"
    >
      Log out
    </button>
  );
}
