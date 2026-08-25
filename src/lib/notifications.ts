import { Role } from "@prisma/client";
import { prisma } from "./db";

export type NotifyInput = {
  userId?: string | null;
  role?: Role | null;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

export async function notify(input: NotifyInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId ?? null,
      role: input.role ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: (input.metadata ?? undefined) as object | undefined,
    },
  });
}

export async function notifyOrderPlaced(orderNumber: string, customerId?: string | null) {
  if (customerId) {
    await notify({
      userId: customerId,
      type: "ORDER_PLACED",
      title: "Your order has been placed.",
      body: `Order ${orderNumber} has been received and will be confirmed shortly.`,
      metadata: { orderNumber },
    });
  }
  await notify({
    role: "ADMIN",
    type: "NEW_ORDER",
    title: "New order received.",
    body: `Order ${orderNumber} is waiting for confirmation.`,
    metadata: { orderNumber },
  });
}

export async function notifyOrderStatus(orderNumber: string, status: string, customerId?: string | null) {
  if (!customerId) return;
  await notify({
    userId: customerId,
    type: "ORDER_STATUS",
    title: "Order update",
    body: `Order ${orderNumber} is now ${status.replaceAll("_", " ").toLowerCase()}.`,
    metadata: { orderNumber, status },
  });
}
