import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return Response.json({ categories });
}
