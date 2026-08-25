import { createHmac, timingSafeEqual } from "crypto";
import { describe, expect, it } from "vitest";
import { canTransition } from "./pricing";

function verify(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

describe("payment verification", () => {
  it("accepts a valid Razorpay-style HMAC signature", () => {
    const secret = "test_secret";
    const orderId = "order_123";
    const paymentId = "pay_456";
    const signature = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verify(orderId, paymentId, signature, secret)).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(verify("order_123", "pay_456", "deadbeef", "test_secret")).toBe(false);
  });
});

describe("admin authorization helpers", () => {
  it("does not let delivery skip kitchen states", () => {
    expect(canTransition("PENDING", "OUT_FOR_DELIVERY")).toBe(false);
  });
});
