import { describe, expect, it } from "vitest";
import {
  calculateOrderTotals,
  canTransition,
  couponDiscount,
  deliveryFeeFor,
  lineTotal,
  nextOrderNumber,
  taxOn,
} from "@/lib/pricing";

describe("line totals", () => {
  it("multiplies unit price by quantity", () => {
    expect(lineTotal({ unitPrice: 199, quantity: 2 })).toBe(398);
  });

  it("adds option and addon prices before quantity", () => {
    expect(
      lineTotal({
        unitPrice: 200,
        quantity: 2,
        optionDeltas: [20],
        addonPrices: [30],
      }),
    ).toBe(500);
  });

  it("rejects unavailable items", () => {
    expect(() => lineTotal({ unitPrice: 100, quantity: 1, available: false })).toThrow(
      "UNAVAILABLE_ITEM",
    );
  });

  it("rejects unset prices", () => {
    expect(() => lineTotal({ unitPrice: null, quantity: 1 })).toThrow("PRICE_UNSET");
  });

  it("rejects invalid quantity", () => {
    expect(() => lineTotal({ unitPrice: 100, quantity: 0 })).toThrow("INVALID_QUANTITY");
  });
});

describe("coupons", () => {
  const coupon = {
    discountType: "PERCENTAGE" as const,
    discountValue: 10,
    minOrder: 299,
    maxDiscount: 100,
    isActive: true,
  };

  it("applies WELCOME10 with a cap", () => {
    expect(couponDiscount(2000, coupon)).toBe(100);
    expect(couponDiscount(500, coupon)).toBe(50);
  });

  it("does not apply below minimum order", () => {
    expect(couponDiscount(200, coupon)).toBe(0);
  });

  it("applies a fixed discount without exceeding subtotal", () => {
    expect(
      couponDiscount(80, {
        discountType: "FIXED",
        discountValue: 100,
        minOrder: 0,
        maxDiscount: null,
        isActive: true,
      }),
    ).toBe(80);
  });
});

describe("tax and delivery", () => {
  it("calculates tax from a configured rate", () => {
    expect(taxOn(100, 5)).toBe(5);
    expect(taxOn(100, 0)).toBe(0);
  });

  it("waives delivery above the free threshold", () => {
    expect(
      deliveryFeeFor(500, { deliveryFee: 40, minOrder: 200, freeDeliveryThreshold: 499 }),
    ).toBe(0);
    expect(
      deliveryFeeFor(300, { deliveryFee: 40, minOrder: 200, freeDeliveryThreshold: 499 }),
    ).toBe(40);
  });

  it("rejects orders below the minimum", () => {
    expect(() =>
      deliveryFeeFor(100, { deliveryFee: 40, minOrder: 200, freeDeliveryThreshold: null }),
    ).toThrow("BELOW_MINIMUM_ORDER");
  });
});

describe("order totals", () => {
  it("computes subtotal, discount, tax, delivery and grand total on the server", () => {
    const totals = calculateOrderTotals({
      lines: [{ unitPrice: 300, quantity: 2 }],
      coupon: {
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrder: 299,
        maxDiscount: 100,
        isActive: true,
      },
      delivery: { deliveryFee: 40, minOrder: 0, freeDeliveryThreshold: 1000 },
      taxPercent: 5,
    });

    expect(totals.subtotal).toBe(600);
    expect(totals.discount).toBe(60);
    expect(totals.tax).toBe(27);
    expect(totals.deliveryFee).toBe(40);
    expect(totals.total).toBe(607);
  });
});

describe("order status", () => {
  it("allows the standard kitchen flow", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "PREPARING")).toBe(true);
    expect(canTransition("PREPARING", "READY")).toBe(true);
    expect(canTransition("READY", "OUT_FOR_DELIVERY")).toBe(true);
    expect(canTransition("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true);
  });

  it("blocks skipped or reverse transitions", () => {
    expect(canTransition("PENDING", "DELIVERED")).toBe(false);
    expect(canTransition("DELIVERED", "PREPARING")).toBe(false);
    expect(canTransition("DELIVERED", "CANCELLED")).toBe(false);
  });

  it("builds human-friendly order numbers", () => {
    expect(nextOrderNumber(new Date("2026-08-25T10:00:00Z"), 1)).toBe("VKF-20260825-0001");
  });
});
