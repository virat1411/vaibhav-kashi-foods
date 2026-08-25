import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^[0-9+\- ]{10,15}$/).optional(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const addressSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[0-9+\- ]{10,15}$/),
  email: z.string().email().optional().or(z.literal("")),
  line1: z.string().min(4).max(160),
  house: z.string().max(80).optional(),
  landmark: z.string().max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().max(80).optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/),
  type: z.enum(["HOME", "WORK", "OTHER"]).optional(),
});

export const cartAddSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  specialInstructions: z.string().max(240).optional(),
  selectedOptions: z
    .array(z.object({ groupId: z.string().uuid(), optionId: z.string().uuid() }))
    .optional(),
  selectedAddons: z.array(z.object({ addonId: z.string().uuid() })).optional(),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  notes: z.string().max(240).optional(),
  couponCode: z.string().max(32).optional(),
  saveAddress: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
  website: z.string().max(0).optional(),
});

export const couponApplySchema = z.object({
  code: z.string().min(2).max(32),
});
