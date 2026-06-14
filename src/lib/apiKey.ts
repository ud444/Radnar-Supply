import crypto from "crypto";
import { db } from "./prisma";

export const SCOPES = [
  { id: "products.read",    label: "Read products"           },
  { id: "products.write",   label: "Create / update products" },
  { id: "inventory.read",   label: "Read inventory"          },
  { id: "inventory.write",  label: "Update stock levels"     },
  { id: "orders.read",      label: "Read orders"             },
  { id: "orders.write",     label: "Update order status"     },
  { id: "customers.read",   label: "Read customers"          },
] as const;

export type ScopeId = (typeof SCOPES)[number]["id"];

const KEY_PREFIX = "rs_live_";

export function generateKey() {
  const random = crypto.randomBytes(28).toString("hex");           // 56 hex chars
  const full   = `${KEY_PREFIX}${random}`;                          // rs_live_ + 56 = 64
  const prefix = full.slice(0, 16);                                 // "rs_live_a1b2c3d4"
  const hash   = crypto.createHash("sha256").update(full).digest("hex");
  return { full, prefix, hash };
}

/** Verify a Bearer token from an incoming request. Returns the key row if valid + active. */
export async function verifyKey(authHeader: string | null) {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token.startsWith(KEY_PREFIX)) return null;

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const key  = await db.apiKey.findUnique({ where: { hash } });
  if (!key || key.revokedAt) return null;

  // Touch lastUsedAt — fire and forget
  db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { id: key.id, name: key.name, scopes: key.scopes.split(",").filter(Boolean) as ScopeId[] };
}

/** Guard for v1 API routes. Returns Response on failure, or null on success. */
export async function requireScope(req: Request, scope: ScopeId) {
  const key = await verifyKey(req.headers.get("authorization"));
  if (!key) return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } }), key: null };
  if (!key.scopes.includes(scope)) return { error: new Response(JSON.stringify({ error: `Missing scope: ${scope}` }), { status: 403, headers: { "content-type": "application/json" } }), key };
  return { error: null, key };
}
