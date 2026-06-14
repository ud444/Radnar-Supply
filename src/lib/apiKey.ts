import crypto from "crypto";
import { db } from "./prisma";

/** Synclayer-compatible scope set: Read / Write / Delete. */
export const SCOPES = [
  { id: "read",   label: "Read",   desc: "View products, inventory levels, and orders." },
  { id: "write",  label: "Write",  desc: "Create / update products and set inventory levels." },
  { id: "delete", label: "Delete", desc: "Remove products from the catalogue." },
] as const;

export type ScopeId = (typeof SCOPES)[number]["id"];

const KEY_PREFIX = "rs_live_";

export function generateKey() {
  const random = crypto.randomBytes(28).toString("hex");
  const full   = `${KEY_PREFIX}${random}`;
  const prefix = full.slice(0, 16);
  const hash   = crypto.createHash("sha256").update(full).digest("hex");
  return { full, prefix, hash };
}

export async function verifyKey(authHeader: string | null) {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token.startsWith(KEY_PREFIX)) return null;

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const key  = await db.apiKey.findUnique({ where: { hash } });
  if (!key || key.revokedAt) return null;

  db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { id: key.id, name: key.name, scopes: key.scopes.split(",").filter(Boolean) as ScopeId[] };
}

/** Guard for /api/sync routes. Pass either a single scope or array; ALL must be present. */
export async function requireScope(req: Request, scope: ScopeId | ScopeId[]) {
  const need = Array.isArray(scope) ? scope : [scope];
  const key  = await verifyKey(req.headers.get("authorization"));
  if (!key) {
    return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } }), key: null };
  }
  for (const s of need) {
    if (!key.scopes.includes(s)) {
      return { error: new Response(JSON.stringify({ error: `Missing scope: ${s}` }), { status: 403, headers: { "content-type": "application/json" } }), key };
    }
  }
  return { error: null, key };
}
