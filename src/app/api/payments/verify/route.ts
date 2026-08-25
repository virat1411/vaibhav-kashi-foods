import { z } from "zod";
import { prisma } from "@/lib/db";
import { razorpayGateway } from "@/lib/payments";
import { handleError, jsonError, readJson } from "@/lib/http";
import { notifyOrderStatus } from "@/lib/notifications";

const schema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await readJson(request));
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: body.orderId }, { orderNumber: body.orderId }] },
      include: { payments: true },
    });
    if (!order) return jsonError("Order not found.", 404);

    const valid = razorpayGateway.verifySignature({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });

    if (!valid) {
      await prisma.payment.updateMany({
        where: { orderId: order.id, method: "RAZORPAY" },
        data: { status: "FAILED", failureReason: "Signature verification failed" },
      });
      return jsonError("Payment could not be completed. Please try again.", 400);
    }

    await prisma.payment.updateMany({
      where: { orderId: order.id, method: "RAZORPAY" },
      data: {
        status: "PAID",
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        razorpaySignature: body.razorpaySignature,
      },
    });

    if (order.status === "PENDING") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      });
      await prisma.orderStatusEvent.create({
        data: { orderId: order.id, status: "CONFIRMED", note: "Payment verified" },
      });
      await notifyOrderStatus(order.orderNumber, "CONFIRMED", order.userId);
    }

    const next = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, payments: true, statusEvents: true },
    });
    return Response.json({ order: next });
  } catch (error) {
    return handleError(error);
  }
}
