import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FoodCard } from "@/components/food-card";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/favorites");
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: { menuItem: { include: { images: true, category: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-brick">Favorites</h1>
      {favorites.length === 0 && <p className="mt-6 text-muted">Save dishes from the menu to see them here.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav) => (
          <FoodCard
            key={fav.menuItemId}
            item={{ ...fav.menuItem, price: fav.menuItem.price === null ? null : Number(fav.menuItem.price) }}
          />
        ))}
      </div>
    </div>
  );
}
