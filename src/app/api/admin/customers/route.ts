import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    return Response.json({ customers });
  } catch (error) {
    return handleError(error);
  }
}
