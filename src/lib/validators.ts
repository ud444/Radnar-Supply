import { z } from "zod";

export const shippingAddressSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, "Name required"),
  line1: z.string().min(2, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  postcode: z.string().min(3, "Postcode required"),
  country: z.string().default("GB"),
  phone: z.string().optional(),
});

export const sourcingRequestSchema = z.object({
  type: z.enum(["STANDARD", "PRIVATE"]).default("STANDARD"),
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  item: z.string().min(3, "Tell us what you're looking for"),
  size: z.string().optional(),
  budget: z.string().optional(),
  detail: z.string().optional(),
  imageUrls: z.string().default("[]"), // JSON array string from the upload widget
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  description: z.string().min(2),
  priceCents: z.coerce.number().int().positive(),
  brandId: z.string().cuid(),
  categoryId: z.string().cuid(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});
