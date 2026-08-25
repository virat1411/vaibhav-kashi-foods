import { z } from "zod";
import { ItemAvailability } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, readJson } from "@/lib/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { id } = await params;
    const body = z
      .object({
        availability: z.nativeEnum(ItemAvailability).optional(),
        price: z.number().nullable().optional(),
        isPopular: z.boolean().optional(),
        isBestseller: z.boolean().optional(),
        isRecommended: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
      .parse(await readJson(request));
    const item = await prisma.menuItem.update({ where: { id }, data: body });
    return Response.json({ item });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    await prisma.menuItem.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { id } = await params;
    const body = z
      .object({
        url: z.string().min(1),
        alt: z.string().min(1),
        isPrimary: z.boolean().optional(),
      })
      .parse(await readJson(request));
    if (body.isPrimary) {
      await prisma.menuItemImage.updateMany({ where: { menuItemId: id }, data: { isPrimary: false } });
    }
    const image = await prisma.menuItemImage.create({
      data: { menuItemId: id, url: body.url, alt: body.alt, isPrimary: body.isPrimary ?? false },
    });
    return Response.json({ image });
  } catch (error) {
    return handleError(error);
  }
}
