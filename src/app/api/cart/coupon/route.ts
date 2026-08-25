import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { couponApplySchema } from "@/lib/validators";
import { couponDiscount } from "@/lib/pricing";
import { handleError, jsonError, readJson } from "@/lib/http";
import { assertItemPurchasable } from "@/lib/cart";

export async function POST(request: Request) {
  try {
    const { code } = couponApplySchema.parse(await readJson(request));
    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!coupon) return jsonError("This coupon is not valid.", 400);
    const cart = await getOrCreateCart();
    let subtotal = 0;
    for (const item of cart.items) {
      const price = assertItemPurchasable(item.menuItem);
      subtotal += price * item.quantity;
    }
    const discount = couponDiscount(subtotal, {
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrder: Number(coupon.minOrder),
      maxDiscount: coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
      isActive: coupon.isActive,
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
    });
    if (discount <= 0) {
      return jsonError("This coupon cannot be applied to the current cart.", 400);
    }
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: coupon.code } });
    return Response.json({ coupon: { code: coupon.code, discount }, cart: await getOrCreateCart() });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    const cart = await getOrCreateCart();
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    return Response.json({ cart: await getOrCreateCart() });
  } catch (error) {
    return handleError(error);
  }
}
