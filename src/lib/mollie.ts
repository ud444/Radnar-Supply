import createMollieClient, { MollieClient } from "@mollie/api-client";

let _client: MollieClient | null = null;
export function mollie(): MollieClient {
  if (_client) return _client;
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) throw new Error("MOLLIE_API_KEY missing");
  _client = createMollieClient({ apiKey });
  return _client;
}

export const siteUrl = () => {
  const u = process.env.NEXT_PUBLIC_SITE_URL;
  if (!u) throw new Error("NEXT_PUBLIC_SITE_URL missing");
  return u.replace(/\/$/, "");
};
