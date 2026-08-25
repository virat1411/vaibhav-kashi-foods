import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await prisma.menuItem.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      availability: { not: "HIDDEN" },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      optionGroups: {
        include: { options: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
      addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!item) return jsonError("Item not found.", 404);
  return Response.json({ item });
}
