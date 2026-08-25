import { prisma } from "@/lib/db";
import { assertItemPurchasable, getOrCreateCart } from "@/lib/cart";
import { cartAddSchema } from "@/lib/validators";
import { handleError, readJson } from "@/lib/http";

export async function GET() {
  try {
    const cart = await getOrCreateCart();
    return Response.json({ cart });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = cartAddSchema.parse(await readJson(request));
    const cart = await getOrCreateCart();
    const item = await prisma.menuItem.findUnique({
      where: { id: body.menuItemId },
      include: { optionGroups: { include: { options: true } }, addons: true },
    });
    if (!item) throw Object.assign(new Error("Item not found."), { status: 404 });
    assertItemPurchasable(item);

    const added = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId: item.id,
        quantity: body.quantity,
        specialInstructions: body.specialInstructions,
        selectedOptions: body.selectedOptions ?? [],
        selectedAddons: body.selectedAddons ?? [],
      },
    });
    const next = await getOrCreateCart();
    return Response.json({ item: added, cart: next });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    const cart = await getOrCreateCart();
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    return Response.json({ cart: await getOrCreateCart() });
  } catch (error) {
    return handleError(error);
  }
}
