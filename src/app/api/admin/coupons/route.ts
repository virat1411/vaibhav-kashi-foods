import { z } from "zod";
import { DiscountType } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, jsonError, readJson } from "@/lib/http";

const schema = z.object({
  code: z.string().min(2).max(32),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive(),
  minOrder: z.number().min(0).optional(),
  maxDiscount: z.number().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  usageLimit: z.number().int().nullable().optional(),
  perCustomerLimit: z.number().int().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ coupons });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const body = schema.parse(await readJson(request));
    const coupon = await prisma.coupon.create({
      data: {
        ...body,
        code: body.code.trim().toUpperCase(),
        minOrder: body.minOrder ?? 0,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    });
    return Response.json({ coupon });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const body = schema.partial().extend({ id: z.string().uuid() }).parse(await readJson(request));
    const { id, ...data } = body;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.startsAt !== undefined ? { startsAt: data.startsAt ? new Date(data.startsAt) : null } : {}),
        ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
      },
    });
    return Response.json({ coupon });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return jsonError("Missing id.", 400);
    await prisma.coupon.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
