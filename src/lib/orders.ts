import { prisma } from "./db";
import { calculateOrderTotals, nextOrderNumber } from "./pricing";
import { isRestaurantAcceptingOrders, pincodeAllowed } from "./restaurant";
import { notifyOrderPlaced } from "./notifications";
import { assertItemPurchasable } from "./cart";
import { parseJsonArray } from "./utils";
import { Decimal } from "@prisma/client/runtime/library";

type SelectedOption = { groupId: string; optionId: string };
type SelectedAddon = { addonId: string };

export type CheckoutAddress = {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  house?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  type?: "HOME" | "WORK" | "OTHER";
};

function toNumber(value: Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export async function getSettingsBundle() {
  const [settings, hours, zones] = await Promise.all([
    prisma.restaurantSettings.findUnique({ where: { id: "default" } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.deliveryZone.findMany(),
  ]);
  if (!settings) {
    throw Object.assign(new Error("Restaurant settings are missing."), { status: 500 });
  }
  return { settings, hours, zones };
}

export async function createOrderFromCart(input: {
  cartId: string;
  userId?: string | null;
  address: CheckoutAddress;
  paymentMethod: "COD" | "RAZORPAY";
  notes?: string;
  couponCode?: string | null;
}) {
  const { settings, hours, zones } = await getSettingsBundle();
  const accepting = isRestaurantAcceptingOrders(settings, hours);
  if (!accepting.open) {
    throw Object.assign(
      new Error("We're currently closed. Please check back during our opening hours."),
      { status: 409, code: "CLOSED" },
    );
  }

  if (!pincodeAllowed(input.address.pincode, zones)) {
    throw Object.assign(
      new Error("Sorry, we currently don't deliver to this location."),
      { status: 409, code: "OUT_OF_AREA" },
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              optionGroups: { include: { options: true } },
              addons: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw Object.assign(new Error("Your cart is empty."), { status: 400 });
  }

  const couponCode = (input.couponCode || cart.couponCode || "").trim().toUpperCase() || null;
  const coupon = couponCode
    ? await prisma.coupon.findUnique({ where: { code: couponCode } })
    : null;

  if (couponCode && !coupon) {
    throw Object.assign(new Error("This coupon is not valid."), { status: 400 });
  }

  if (coupon && input.userId) {
    const used = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: input.userId },
    });
    if (coupon.perCustomerLimit && used >= coupon.perCustomerLimit) {
      throw Object.assign(new Error("You have already used this coupon."), { status: 400 });
    }
    const totalUsed = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (coupon.usageLimit && totalUsed >= coupon.usageLimit) {
      throw Object.assign(new Error("This coupon is no longer available."), { status: 400 });
    }
  }

  const lines = cart.items.map((item) => {
    const price = assertItemPurchasable(item.menuItem);
    const selectedOptions = parseJsonArray<SelectedOption>(item.selectedOptions);
    const selectedAddons = parseJsonArray<SelectedAddon>(item.selectedAddons);

    const optionDeltas = selectedOptions.map((sel) => {
      const group = item.menuItem.optionGroups.find((g) => g.id === sel.groupId);
      const option = group?.options.find((o) => o.id === sel.optionId && o.isActive);
      if (!option) {
        throw Object.assign(new Error("An item option is no longer available."), { status: 409 });
      }
      return Number(option.priceDelta);
    });

    const addonPrices = selectedAddons.map((sel) => {
      const addon = item.menuItem.addons.find((a) => a.id === sel.addonId && a.isActive);
      if (!addon) {
        throw Object.assign(new Error("An add-on is no longer available."), { status: 409 });
      }
      return Number(addon.price);
    });

    return {
      cartItem: item,
      unitPrice: price,
      quantity: item.quantity,
      optionDeltas,
      addonPrices,
      available: item.menuItem.availability === "AVAILABLE",
      optionsSnapshot: selectedOptions.map((sel) => {
        const group = item.menuItem.optionGroups.find((g) => g.id === sel.groupId);
        const option = group?.options.find((o) => o.id === sel.optionId);
        return { name: option?.name, priceDelta: Number(option?.priceDelta ?? 0) };
      }),
      addonsSnapshot: selectedAddons.map((sel) => {
        const addon = item.menuItem.addons.find((a) => a.id === sel.addonId);
        return { name: addon?.name, price: Number(addon?.price ?? 0) };
      }),
    };
  });

  const totals = calculateOrderTotals({
    lines: lines.map((line) => ({
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      optionDeltas: line.optionDeltas,
      addonPrices: line.addonPrices,
      available: line.available,
    })),
    coupon: coupon
      ? {
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          minOrder: Number(coupon.minOrder),
          maxDiscount: toNumber(coupon.maxDiscount),
          isActive: coupon.isActive,
          startsAt: coupon.startsAt,
          endsAt: coupon.endsAt,
        }
      : null,
    delivery: {
      deliveryFee: Number(settings.deliveryFee),
      minOrder: Number(settings.minOrder),
      freeDeliveryThreshold: toNumber(settings.freeDeliveryThreshold),
    },
    taxPercent: Number(settings.taxPercent),
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const countToday = await prisma.order.count({ where: { createdAt: { gte: todayStart } } });
  const orderNumber = nextOrderNumber(new Date(), countToday + 1);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId ?? null,
        guestName: input.address.name,
        guestPhone: input.address.phone,
        guestEmail: input.address.email ?? null,
        status: "PENDING",
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        couponId: coupon?.id ?? null,
        couponCode: coupon?.code ?? null,
        addressSnapshot: input.address,
        estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
        notes: input.notes ?? null,
        items: {
          create: lines.map((line) => ({
            menuItemId: line.cartItem.menuItemId,
            nameSnapshot: line.cartItem.menuItem.name,
            priceSnapshot: line.unitPrice,
            quantity: line.quantity,
            specialInstructions: line.cartItem.specialInstructions,
            optionsSnapshot: line.optionsSnapshot,
            addonsSnapshot: line.addonsSnapshot,
            lineTotal:
              (line.unitPrice +
                line.optionDeltas.reduce((a, b) => a + b, 0) +
                line.addonPrices.reduce((a, b) => a + b, 0)) *
              line.quantity,
          })),
        },
        payments: {
          create: {
            method: input.paymentMethod,
            status: input.paymentMethod === "COD" ? "COD" : "PENDING",
            amount: totals.total,
            currency: settings.currency,
            provider: input.paymentMethod === "COD" ? "cod" : "razorpay",
          },
        },
        statusEvents: {
          create: { status: "PENDING", note: "Order placed" },
        },
      },
      include: { items: true, payments: true },
    });

    if (coupon && input.userId) {
      await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId: input.userId,
          orderId: created.id,
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null } });

    return created;
  });

  await notifyOrderPlaced(order.orderNumber, input.userId);
  return { order, totals };
}
