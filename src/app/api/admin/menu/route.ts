import { z } from "zod";
import { ItemAvailability, SpiceLevel } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { handleError, jsonError, readJson } from "@/lib/http";

const itemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  categoryId: z.string().uuid(),
  availability: z.nativeEnum(ItemAvailability).optional(),
  isVegetarian: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  spiceLevel: z.nativeEnum(SpiceLevel).optional(),
  prepTimeMinutes: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const items = await prisma.menuItem.findMany({
      include: { category: true, images: true, addons: true, optionGroups: { include: { options: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    });
    return Response.json({ items });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = itemSchema.parse(await readJson(request));
    const item = await prisma.menuItem.create({
      data: {
        ...body,
        slug: slugify(body.name),
        descriptionGenerated: false,
        price: body.price ?? null,
      },
    });
    return Response.json({ item });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = itemSchema.partial().extend({ id: z.string().uuid() }).parse(await readJson(request));
    const { id, ...data } = body;
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { slug: slugify(data.name) } : {}),
        ...(data.description !== undefined ? { descriptionGenerated: false } : {}),
      },
    });
    return Response.json({ item });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("Missing id.", 400);
    await prisma.menuItem.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
