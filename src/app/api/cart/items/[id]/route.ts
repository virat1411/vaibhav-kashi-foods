import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { handleError, jsonError, readJson } from "@/lib/http";

const patchSchema = z.object({
  quantity: z.number().int().min(1).max(20).optional(),
  specialInstructions: z.string().max(240).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cart = await getOrCreateCart();
    const body = patchSchema.parse(await readJson(request));
    const item = await prisma.cartItem.findFirst({ where: { id, cartId: cart.id } });
    if (!item) return jsonError("Cart item not found.", 404);
    await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: body.quantity ?? item.quantity,
        specialInstructions:
          body.specialInstructions === undefined ? item.specialInstructions : body.specialInstructions,
      },
    });
    return Response.json({ cart: await getOrCreateCart() });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cart = await getOrCreateCart();
    await prisma.cartItem.deleteMany({ where: { id, cartId: cart.id } });
    return Response.json({ cart: await getOrCreateCart() });
  } catch (error) {
    return handleError(error);
  }
}
