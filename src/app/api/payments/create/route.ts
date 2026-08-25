import { z } from "zod";
import { prisma } from "@/lib/db";
import { razorpayGateway } from "@/lib/payments";
import { handleError, jsonError, readJson } from "@/lib/http";
import { paise } from "@/lib/site";

const schema = z.object({ orderId: z.string() });

export async function POST(request: Request) {
  try {
    const { orderId } = schema.parse(await readJson(request));
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
      include: { payments: true },
    });
    if (!order) return jsonError("Order not found.", 404);
    if (!razorpayGateway.isConfigured()) {
      return jsonError("Online payment is not configured yet.", 503);
    }
    const created = await razorpayGateway.createOrder({
      amountPaise: paise(Number(order.total)),
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    });
    await prisma.payment.updateMany({
      where: { orderId: order.id, method: "RAZORPAY" },
      data: { razorpayOrderId: created.id, status: "PENDING" },
    });
    return Response.json({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      razorpayOrderId: created.id,
      amount: created.amount,
      currency: created.currency,
    });
  } catch (error) {
    return handleError(error);
  }
}
