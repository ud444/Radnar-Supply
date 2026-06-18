import Stripe from "stripe";

let _client: Stripe | null = null;

export function stripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  // Omit apiVersion so we always use the SDK's pinned default — avoids the
  // build breaking when the stripe package bumps its LatestApiVersion literal.
  _client = new Stripe(key);
  return _client;
}

export { siteUrl } from "./url";
