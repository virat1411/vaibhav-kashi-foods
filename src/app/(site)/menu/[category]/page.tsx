import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MenuBoard } from "@/components/menu-board";

export default async function CategoryMenuPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [categories, items] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.menuItem.findMany({
      where: { categoryId: category.id, availability: { not: "HIDDEN" } },
      include: { images: true, category: true, optionGroups: { include: { options: true } }, addons: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <MenuBoard
      categories={categories}
      items={items.map((item) => ({ ...item, price: item.price === null ? null : Number(item.price) }))}
      activeSlug={slug}
      query={{}}
    />
  );
}
