import { prisma } from "@/lib/db";
import { isRestaurantAcceptingOrders } from "@/lib/restaurant";

export async function ClosedBanner() {
  try {
    const [settings, hours] = await Promise.all([
      prisma.restaurantSettings.findUnique({ where: { id: "default" } }),
      prisma.openingHours.findMany(),
    ]);
    if (!settings) return null;
    const state = isRestaurantAcceptingOrders(settings, hours);
    if (state.open) return null;
    return (
      <div className="bg-brick px-4 py-2 text-center text-sm text-cream">
        We&apos;re currently closed. Please check back during our opening hours.
      </div>
    );
  } catch {
    return null;
  }
}
