import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const vegetarian = searchParams.get("vegetarian") === "1";
  const popular = searchParams.get("popular") === "1";
  const spicy = searchParams.get("spicy") === "1";
  const sort = searchParams.get("sort") ?? "recommended";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where: Prisma.MenuItemWhereInput = {
    availability: { not: "HIDDEN" },
    category: { isActive: true },
  };

  if (category) where.category = { is: { slug: category, isActive: true } };
  if (vegetarian) where.isVegetarian = true;
  if (popular) where.isPopular = true;
  if (spicy) where.spiceLevel = { in: ["MEDIUM", "HOT"] };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {
      gte: minPrice ? Number(minPrice) : undefined,
      lte: maxPrice ? Number(maxPrice) : undefined,
    };
  }

  const orderBy: Prisma.MenuItemOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ price: { sort: "asc", nulls: "last" } }]
      : sort === "price-desc"
        ? [{ price: { sort: "desc", nulls: "last" } }]
        : sort === "popular"
          ? [{ isPopular: "desc" }, { sortOrder: "asc" }]
          : [{ isRecommended: "desc" }, { isPopular: "desc" }, { sortOrder: "asc" }];

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.menuItem.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        optionGroups: { include: { options: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } },
        addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy,
    }),
  ]);

  return Response.json({ categories, items });
}
