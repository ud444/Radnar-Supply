import Stripe from "stripe";

let _client: Stripe | null = null;

export function stripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  _client = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  return _client;
}

export { siteUrl } from "./url";
