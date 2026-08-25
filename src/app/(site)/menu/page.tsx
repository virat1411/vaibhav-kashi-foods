import { prisma } from "@/lib/db";
import { MenuBoard } from "@/components/menu-board";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vegetarian?: string; popular?: string; spicy?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const [categories, items] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.menuItem.findMany({
      where: {
        availability: { not: "HIDDEN" },
        category: { isActive: true },
        ...(sp.q
          ? {
              OR: [
                { name: { contains: sp.q, mode: "insensitive" } },
                { description: { contains: sp.q, mode: "insensitive" } },
                { category: { name: { contains: sp.q, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(sp.vegetarian === "1" ? { isVegetarian: true } : {}),
        ...(sp.popular === "1" ? { isPopular: true } : {}),
        ...(sp.spicy === "1" ? { spiceLevel: { in: ["MEDIUM", "HOT"] } } : {}),
      },
      include: { images: true, category: true, optionGroups: { include: { options: true } }, addons: true },
      orderBy:
        sp.sort === "price-asc"
          ? { price: "asc" }
          : sp.sort === "price-desc"
            ? { price: "desc" }
            : sp.sort === "popular"
              ? { isPopular: "desc" }
              : { sortOrder: "asc" },
    }),
  ]);

  return (
    <MenuBoard
      categories={categories}
      items={items.map((item) => ({ ...item, price: item.price === null ? null : Number(item.price) }))}
      activeSlug={undefined}
      query={sp}
    />
  );
}
