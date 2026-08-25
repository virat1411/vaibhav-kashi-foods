import { cookies } from "next/headers";
import { ItemAvailability } from "@prisma/client";
import { prisma } from "./db";
import { getSession } from "./auth";

const CART_COOKIE = "vkf_cart";

export async function getOrCreateCart() {
  const session = await getSession();
  const jar = await cookies();
  let sessionId = jar.get(CART_COOKIE)?.value;

  if (session) {
    const existing = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: cartInclude,
    });
    if (existing) {
      if (sessionId) {
        const guest = await prisma.cart.findUnique({
          where: { sessionId },
          include: { items: true },
        });
        if (guest && guest.id !== existing.id && guest.items.length) {
          await mergeGuestCart(existing.id, guest.id);
        }
      }
      return prisma.cart.findUniqueOrThrow({
        where: { id: existing.id },
        include: cartInclude,
      });
    }
  }

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    jar.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const bySession = await prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude,
  });
  if (bySession) {
    if (session && !bySession.userId) {
      return prisma.cart.update({
        where: { id: bySession.id },
        data: { userId: session.id },
        include: cartInclude,
      });
    }
    return bySession;
  }

  return prisma.cart.create({
    data: {
      sessionId: session ? undefined : sessionId,
      userId: session?.id,
    },
    include: cartInclude,
  });
}

async function mergeGuestCart(userCartId: string, guestCartId: string) {
  const guestItems = await prisma.cartItem.findMany({ where: { cartId: guestCartId } });
  for (const item of guestItems) {
    await prisma.cartItem.create({
      data: {
        cartId: userCartId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        selectedOptions: item.selectedOptions ?? [],
        selectedAddons: item.selectedAddons ?? [],
      },
    });
  }
  await prisma.cart.delete({ where: { id: guestCartId } });
}

export const cartInclude = {
  items: {
    include: {
      menuItem: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const } },
          category: true,
          optionGroups: { include: { options: true } },
          addons: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export function assertItemPurchasable(item: {
  availability: ItemAvailability;
  price: { toNumber?: () => number } | number | null;
}) {
  if (item.availability !== "AVAILABLE") {
    throw Object.assign(new Error("This item is currently unavailable."), { status: 409 });
  }
  const price = item.price === null || item.price === undefined ? null : Number(item.price);
  if (price === null) {
    throw Object.assign(
      new Error("This item does not have a price yet. Please call the restaurant or check back later."),
      { status: 409 },
    );
  }
  return price;
}
