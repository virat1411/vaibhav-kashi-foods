import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ItemDetail } from "@/components/item-detail";
import { SITE } from "@/lib/site";

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.menuItem.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      optionGroups: { include: { options: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!item || item.availability === "HIDDEN") notFound();

  return (
    <ItemDetail
      item={{
        ...item,
        price: item.price === null ? null : Number(item.price),
        addons: item.addons.map((a) => ({ ...a, price: Number(a.price) })),
        optionGroups: item.optionGroups.map((g) => ({
          ...g,
          options: g.options.map((o) => ({ ...o, priceDelta: Number(o.priceDelta) })),
        })),
      }}
      restaurant={SITE.name}
    />
  );
}
