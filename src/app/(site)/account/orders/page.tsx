import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/site";
import { ReorderButton } from "@/components/reorder-button";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-brick">My orders</h1>
      <div className="mt-6 space-y-4">
        {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl bg-white p-5">
            <div className="flex justify-between">
              <Link href={`/order/${order.orderNumber}`} className="font-medium text-brick">{order.orderNumber}</Link>
              <span className="text-sm">{order.status.replaceAll("_", " ")}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{order.createdAt.toLocaleString("en-IN")} · {order.items.map((i) => i.nameSnapshot).join(", ")}</p>
            <div className="mt-3 flex items-center justify-between">
              <span>{formatInr(Number(order.total))}</span>
              <ReorderButton orderId={order.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
