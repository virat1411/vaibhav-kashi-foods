import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [
      todaysOrders,
      pending,
      preparing,
      delivered,
      cancelled,
      recent,
      topItems,
    ] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: start } }, include: { payments: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PREPARING" } }),
      prisma.order.count({ where: { createdAt: { gte: start }, status: "DELIVERED" } }),
      prisma.order.count({ where: { createdAt: { gte: start }, status: "CANCELLED" } }),
      prisma.order.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
        include: { items: true, payments: true },
      }),
      prisma.orderItem.groupBy({
        by: ["nameSnapshot"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 6,
      }),
    ]);

    const revenue = todaysOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.total), 0);

    return Response.json({
      today: {
        orders: todaysOrders.length,
        revenue,
        pending,
        preparing,
        delivered,
        cancelled,
      },
      recent,
      topItems,
    });
  } catch (error) {
    return handleError(error);
  }
}
