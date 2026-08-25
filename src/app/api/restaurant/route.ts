import { prisma } from "@/lib/db";
import { isRestaurantAcceptingOrders } from "@/lib/restaurant";

export async function GET() {
  const [settings, hours, zones] = await Promise.all([
    prisma.restaurantSettings.findUnique({ where: { id: "default" } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.deliveryZone.findMany({ where: { isActive: true } }),
  ]);
  const accepting = settings ? isRestaurantAcceptingOrders(settings, hours) : { open: false, reason: "CLOSED_MANUAL" };
  return Response.json({
    settings: settings
      ? {
          name: settings.name,
          phone: settings.phone,
          email: settings.email,
          addressLine1: settings.addressLine1,
          addressLine2: settings.addressLine2,
          city: settings.city,
          state: settings.state,
          pincode: settings.pincode,
          logoUrl: settings.logoUrl,
          instagramUrl: settings.instagramUrl,
          whatsappNumber: settings.whatsappNumber,
          whatsappOrderingEnabled: settings.whatsappOrderingEnabled,
          mapsQuery: settings.mapsQuery,
          minOrder: settings.minOrder,
          deliveryFee: settings.deliveryFee,
          freeDeliveryThreshold: settings.freeDeliveryThreshold,
          taxPercent: settings.taxPercent,
          estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
          currency: settings.currency,
        }
      : null,
    hours,
    zones,
    accepting,
  });
}
