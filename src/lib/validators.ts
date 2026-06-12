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
