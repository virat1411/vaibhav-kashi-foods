import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatInr } from "@/lib/site";
import { OrderTimeline } from "@/components/order-timeline";
import { WhatsAppOrder } from "@/components/whatsapp-order";

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await getSession();
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: { items: true, payments: true, statusEvents: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();
  if (order.userId && session?.role === "CUSTOMER" && order.userId !== session.id) notFound();

  const settings = await prisma.restaurantSettings.findUnique({ where: { id: "default" } });
  const address = order.addressSnapshot as { line1?: string; city?: string; pincode?: string; name?: string };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-saffron">Order confirmation</p>
      <h1 className="font-display mt-2 text-4xl text-brick">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.status.replaceAll("_", " ")} · {order.payments[0]?.status} · ETA ~{order.estimatedDeliveryMinutes ?? 45} min
      </p>
      <OrderTimeline status={order.status} />
      <ul className="mt-8 space-y-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between rounded-2xl bg-white p-4 text-sm">
            <span>
              {item.nameSnapshot} × {item.quantity}
            </span>
            <span>{formatInr(Number(item.lineTotal))}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatInr(Number(order.subtotal))}</dd></div>
        <div className="flex justify-between"><dt>Discount</dt><dd>{formatInr(Number(order.discount))}</dd></div>
        <div className="flex justify-between"><dt>Tax</dt><dd>{formatInr(Number(order.tax))}</dd></div>
        <div className="flex justify-between"><dt>Delivery</dt><dd>{formatInr(Number(order.deliveryFee))}</dd></div>
        <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatInr(Number(order.total))}</dd></div>
      </dl>
      {settings?.whatsappOrderingEnabled && settings.whatsappNumber && (
        <WhatsAppOrder
          phone={settings.whatsappNumber}
          restaurant={settings.name}
          customerName={address.name ?? order.guestName ?? "Guest"}
          items={order.items.map((i) => ({ name: i.nameSnapshot, quantity: i.quantity }))}
          address={`${address.line1 ?? ""}, ${address.city ?? ""} ${address.pincode ?? ""}`}
          total={formatInr(Number(order.total))}
        />
      )}
    </div>
  );
}
