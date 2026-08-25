export type Money = number;

export type CouponInput = {
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrder: number;
  maxDiscount: number | null;
  isActive: boolean;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
};

export type DeliverySettings = {
  deliveryFee: number;
  minOrder: number;
  freeDeliveryThreshold: number | null;
};

export type LineInput = {
  unitPrice: number | null;
  quantity: number;
  optionDeltas?: number[];
  addonPrices?: number[];
  available?: boolean;
};

export function roundMoney(value: number): Money {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineTotal(input: LineInput): number {
  if (input.available === false) {
    throw new Error("UNAVAILABLE_ITEM");
  }
  if (input.unitPrice === null || input.unitPrice === undefined) {
    throw new Error("PRICE_UNSET");
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new Error("INVALID_QUANTITY");
  }
  const options = (input.optionDeltas ?? []).reduce((sum, n) => sum + n, 0);
  const addons = (input.addonPrices ?? []).reduce((sum, n) => sum + n, 0);
  return roundMoney((input.unitPrice + options + addons) * input.quantity);
}

export function subtotalFromLines(lines: LineInput[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + lineTotal(line), 0));
}

export function couponDiscount(subtotal: number, coupon: CouponInput | null, now = new Date()): number {
  if (!coupon || !coupon.isActive) return 0;
  if (subtotal < coupon.minOrder) return 0;
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return 0;
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return 0;

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = subtotal * (coupon.discountValue / 100);
    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  return roundMoney(Math.max(0, Math.min(discount, subtotal)));
}

export function deliveryFeeFor(subtotalAfterDiscount: number, settings: DeliverySettings): number {
  if (subtotalAfterDiscount < settings.minOrder) {
    throw new Error("BELOW_MINIMUM_ORDER");
  }
  if (
    settings.freeDeliveryThreshold !== null &&
    subtotalAfterDiscount >= settings.freeDeliveryThreshold
  ) {
    return 0;
  }
  return roundMoney(settings.deliveryFee);
}

export function taxOn(amount: number, taxPercent: number): number {
  if (taxPercent < 0) throw new Error("INVALID_TAX");
  return roundMoney(amount * (taxPercent / 100));
}

export type OrderTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  deliveryFee: number;
  total: number;
};

export function calculateOrderTotals(input: {
  lines: LineInput[];
  coupon: CouponInput | null;
  delivery: DeliverySettings;
  taxPercent: number;
  now?: Date;
}): OrderTotals {
  const subtotal = subtotalFromLines(input.lines);
  const discount = couponDiscount(subtotal, input.coupon, input.now);
  const afterDiscount = roundMoney(subtotal - discount);
  const deliveryFee = deliveryFeeFor(afterDiscount, input.delivery);
  const tax = taxOn(afterDiscount, input.taxPercent);
  const total = roundMoney(afterDiscount + tax + deliveryFee);

  return {
    subtotal,
    discount,
    taxable: afterDiscount,
    tax,
    deliveryFee,
    total,
  };
}

export const ORDER_FLOW: Array<
  "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED"
> = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];

export function canTransition(
  from: string,
  to: string,
): boolean {
  if (to === "CANCELLED") {
    return from !== "DELIVERED" && from !== "CANCELLED";
  }
  const fromIndex = ORDER_FLOW.indexOf(from as (typeof ORDER_FLOW)[number]);
  const toIndex = ORDER_FLOW.indexOf(to as (typeof ORDER_FLOW)[number]);
  if (fromIndex === -1 || toIndex === -1) return false;
  return toIndex === fromIndex + 1;
}

export function nextOrderNumber(date: Date, sequence: number) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `VKF-${y}${m}${d}-${String(sequence).padStart(4, "0")}`;
}
