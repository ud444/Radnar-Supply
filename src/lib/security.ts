import { headers } from "next/headers";

/**
 * Lightweight in-memory rate limiter (per-instance). Not a substitute for a
 * shared store at scale, but a solid first line against form/auth abuse.
 */
type Hit = { count: number; resetAt: number };
const store = new Map<string, Hit>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const h = store.get(key);
  if (!h || h.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (h.count >= limit) return { ok: false, retryAfter: Math.ceil((h.resetAt - now) / 1000) };
  h.count++;
  return { ok: true, retryAfter: 0 };
}

// Occasional cleanup so the map doesn't grow unbounded.
function sweep() {
  const now = Date.now();
  for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
}

/** Best-effort client IP from proxy headers. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

/**
 * Rate-limit the current request by IP under a named bucket.
 * Returns true if the caller should proceed.
 */
export async function allow(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  if (store.size > 5000) sweep();
  const ip = await clientIp();
  return rateLimit(`${bucket}:${ip}`, limit, windowMs).ok;
}

/** True if a honeypot field was filled — i.e. the submitter is almost certainly a bot. */
export function isBot(form: FormData | Record<string, unknown>, field = "company"): boolean {
  const v = form instanceof FormData ? form.get(field) : form[field];
  return typeof v === "string" && v.trim().length > 0;
}
