import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canTransition } from "@/lib/pricing";
import { notifyOrderStatus } from "@/lib/notifications";
import { handleError, jsonError, readJson } from "@/lib/http";

const schema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().max(240).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN", "STAFF", "DELIVERY"]);
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true, payments: true, statusEvents: { orderBy: { createdAt: "asc" } }, user: true },
    });
    if (!order) return jsonError("Order not found.", 404);
    return Response.json({ order });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN", "STAFF", "DELIVERY"]);
    const { id } = await params;
    const body = schema.parse(await readJson(request));
    const order = await prisma.order.findFirst({ where: { OR: [{ id }, { orderNumber: id }] } });
    if (!order) return jsonError("Order not found.", 404);
    if (!canTransition(order.status, body.status)) {
      return jsonError(`Cannot move this order from ${order.status} to ${body.status}.`, 400);
    }
    await prisma.order.update({ where: { id: order.id }, data: { status: body.status, cancelledReason: body.status === "CANCELLED" ? body.note : order.cancelledReason } });
    await prisma.orderStatusEvent.create({
      data: { orderId: order.id, status: body.status, note: body.note },
    });
    await notifyOrderStatus(order.orderNumber, body.status, order.userId);
    const next = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, payments: true, statusEvents: true },
    });
    return Response.json({ order: next });
  } catch (error) {
    return handleError(error);
  }
}
