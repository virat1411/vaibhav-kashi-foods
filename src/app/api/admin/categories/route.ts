import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { handleError, jsonError, readJson } from "@/lib/http";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  imageKey: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return Response.json({ categories });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = schema.parse(await readJson(request));
    const category = await prisma.category.create({
      data: { ...body, slug: slugify(body.name) },
    });
    return Response.json({ category });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = schema.partial().extend({ id: z.string().uuid() }).parse(await readJson(request));
    const { id, ...data } = body;
    const category = await prisma.category.update({
      where: { id },
      data: { ...data, ...(data.name ? { slug: slugify(data.name) } : {}) },
    });
    return Response.json({ category });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return jsonError("Missing id.", 400);
    const count = await prisma.menuItem.count({ where: { categoryId: id } });
    if (count > 0) return jsonError("Move or delete items in this category first.", 400);
    await prisma.category.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
