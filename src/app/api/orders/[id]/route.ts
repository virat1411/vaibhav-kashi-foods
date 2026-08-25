import { getSession, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, jsonError } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { items: true, payments: true, statusEvents: { orderBy: { createdAt: "asc" } } },
    });
    if (!order) return jsonError("Order not found.", 404);
    if (order.userId && order.userId !== session?.id && session?.role === "CUSTOMER") {
      return jsonError("Order not found.", 404);
    }
    if (!order.userId && !session) {
      return Response.json({ order });
    }
    if (session?.role === "CUSTOMER" && order.userId && order.userId !== session.id) {
      return jsonError("Order not found.", 404);
    }
    return Response.json({ order });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }], userId: session.id },
      include: { items: true },
    });
    if (!order) return jsonError("Order not found.", 404);

    const { getOrCreateCart } = await import("@/lib/cart");
    const cart = await getOrCreateCart();
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    for (const item of order.items) {
      if (!item.menuItemId) continue;
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          selectedOptions: [],
          selectedAddons: [],
        },
      });
    }
    return Response.json({ ok: true, cartId: cart.id });
  } catch (error) {
    return handleError(error);
  }
}
