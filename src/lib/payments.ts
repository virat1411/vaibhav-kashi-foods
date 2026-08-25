import crypto from "crypto";

export type RazorpayOrderResult = {
  id: string;
  amount: number;
  currency: string;
};

export interface PaymentGateway {
  createOrder(input: { amountPaise: number; receipt: string; notes?: Record<string, string> }): Promise<RazorpayOrderResult>;
  verifySignature(input: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean;
}

export class RazorpayGateway implements PaymentGateway {
  constructor(
    private keyId = process.env.RAZORPAY_KEY_ID ?? "",
    private keySecret = process.env.RAZORPAY_KEY_SECRET ?? "",
  ) {}

  isConfigured() {
    return Boolean(this.keyId && this.keySecret);
  }

  async createOrder(input: { amountPaise: number; receipt: string; notes?: Record<string, string> }) {
    if (!this.isConfigured()) {
      throw new Error("RAZORPAY_NOT_CONFIGURED");
    }
    const Razorpay = (await import("razorpay")).default;
    const client = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    const order = await client.orders.create({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    });
    return {
      id: String(order.id),
      amount: Number(order.amount),
      currency: String(order.currency),
    };
  }

  verifySignature(input: { orderId: string; paymentId: string; signature: string }) {
    if (!this.isConfigured()) return false;
    const body = `${input.orderId}|${input.paymentId}`;
    const expected = crypto.createHmac("sha256", this.keySecret).update(body).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(input.signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}

export const razorpayGateway = new RazorpayGateway();
