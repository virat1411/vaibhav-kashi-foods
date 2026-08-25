import { getSession, requireUser } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { createOrderFromCart } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validators";
import { handleError, jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { razorpayGateway } from "@/lib/payments";
import { paise } from "@/lib/site";

export async function GET() {
  try {
    const session = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return Response.json({ orders });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = checkoutSchema.parse(await readJson(request));
    const cart = await getOrCreateCart();
    const { order } = await createOrderFromCart({
      cartId: cart.id,
      userId: session?.id ?? null,
      address: {
        ...body.address,
        email: body.address.email || undefined,
      },
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      couponCode: body.couponCode,
    });

    if (session && body.saveAddress) {
      await prisma.address.create({
        data: {
          userId: session.id,
          type: body.address.type ?? "HOME",
          name: body.address.name,
          phone: body.address.phone,
          line1: body.address.line1,
          house: body.address.house,
          landmark: body.address.landmark,
          city: body.address.city,
          state: body.address.state ?? "Uttar Pradesh",
          pincode: body.address.pincode,
        },
      });
    }

    if (body.paymentMethod === "RAZORPAY") {
      if (!razorpayGateway.isConfigured()) {
        return jsonError(
          "Online payment is not configured yet. Please choose Cash on Delivery or try again later.",
          503,
        );
      }
      const created = await razorpayGateway.createOrder({
        amountPaise: paise(Number(order.total)),
        receipt: order.orderNumber,
        notes: { orderId: order.id, orderNumber: order.orderNumber },
      });
      await prisma.payment.updateMany({
        where: { orderId: order.id, method: "RAZORPAY" },
        data: { razorpayOrderId: created.id, metadata: { razorpay: created } },
      });
      return Response.json({
        order,
        payment: {
          method: "RAZORPAY",
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          razorpayOrderId: created.id,
          amount: created.amount,
          currency: created.currency,
        },
      });
    }

    return Response.json({ order, payment: { method: "COD" } });
  } catch (error) {
    return handleError(error);
  }
}
