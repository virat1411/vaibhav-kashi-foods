import { getSession, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, jsonError, readJson } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  try {
    const session = await requireUser();
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      include: {
        menuItem: {
          include: { images: true, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ favorites });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const { menuItemId } = z.object({ menuItemId: z.string().uuid() }).parse(await readJson(request));
    await prisma.favorite.upsert({
      where: { userId_menuItemId: { userId: session.id, menuItemId } },
      update: {},
      create: { userId: session.id, menuItemId },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get("menuItemId");
    if (!menuItemId) return jsonError("Missing item.", 400);
    await prisma.favorite.deleteMany({ where: { userId: session.id, menuItemId } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
