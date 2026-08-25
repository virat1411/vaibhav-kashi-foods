import { z } from "zod";
import { RestaurantOpenStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, readJson } from "@/lib/http";

const schema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().nullable().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  logoUrl: z.string().optional(),
  instagramUrl: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  whatsappOrderingEnabled: z.boolean().optional(),
  mapsQuery: z.string().optional(),
  openStatus: z.nativeEnum(RestaurantOpenStatus).optional(),
  useScheduledHours: z.boolean().optional(),
  deliveryFee: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().nullable().optional(),
  taxPercent: z.number().min(0).optional(),
  currency: z.string().optional(),
  deliveryRadiusKm: z.number().nullable().optional(),
  estimatedDeliveryMinutes: z.number().int().optional(),
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: z.string(),
        closeTime: z.string(),
        isClosed: z.boolean(),
      }),
    )
    .optional(),
  pincodes: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const [settings, hours, zones] = await Promise.all([
      prisma.restaurantSettings.findUnique({ where: { id: "default" } }),
      prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
      prisma.deliveryZone.findMany(),
    ]);
    return Response.json({ settings, hours, zones });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const body = schema.parse(await readJson(request));
    const { hours, pincodes, ...settings } = body;
    const updated = await prisma.restaurantSettings.update({
      where: { id: "default" },
      data: settings,
    });
    if (hours) {
      for (const h of hours) {
        await prisma.openingHours.upsert({
          where: { dayOfWeek: h.dayOfWeek },
          update: h,
          create: h,
        });
      }
    }
    if (pincodes) {
      await prisma.deliveryZone.upsert({
        where: { id: "varanasi-core" },
        update: { pincodes, isActive: true },
        create: { id: "varanasi-core", name: "Varanasi", pincodes, isActive: true },
      });
    }
    return Response.json({ settings: updated });
  } catch (error) {
    return handleError(error);
  }
}
