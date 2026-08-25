import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    await requireRole(["ADMIN", "STAFF", "DELIVERY"]);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") as OrderStatus | null;
    const payment = searchParams.get("payment") as PaymentStatus | null;
    const range = searchParams.get("range") ?? "today";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (payment) where.payments = { some: { status: payment } };
    if (q) {
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { guestName: { contains: q, mode: "insensitive" } },
        { guestPhone: { contains: q, mode: "insensitive" } },
      ];
    }

    const now = new Date();
    const start = new Date(now);
    if (range === "today") start.setHours(0, 0, 0, 0);
    else if (range === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    } else if (range === "week") {
      start.setDate(start.getDate() - 7);
    } else if (range === "month") {
      start.setDate(start.getDate() - 30);
    } else if (range === "custom" && from && to) {
      where.createdAt = { gte: new Date(from), lte: new Date(to) };
    }
    if (!where.createdAt && range !== "all" && range !== "yesterday" && range !== "custom") {
      where.createdAt = { gte: start };
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true, payments: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ orders });
  } catch (error) {
    return handleError(error);
  }
}
