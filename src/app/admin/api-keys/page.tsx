import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { SCOPES } from "@/lib/apiKey";
import { Icon } from "@/components/admin/icons";
import { NewKeyForm } from "./NewKeyForm";
import { revokeKey } from "./actions";

export const dynamic = "force-dynamic";

export default async function ApiKeys({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { created } = await searchParams;
  const keys = await db.apiKey.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Integrations</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">API Keys</h1>
          <p className="text-sm text-ink/65 mt-2 max-w-prose">
            Issue scoped tokens for sync tools (Synclayer, Zapier, your own scripts).
            Tokens are shown <strong>once</strong> at creation — store them somewhere safe.
          </p>
        </div>
      </div>

      {/* New key reveal (only shown right after creation) */}
      {created ? (
        <div className="mt-6 border-2 border-accent bg-accent/10 p-5">
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-accent">New Key — Copy Now</div>
          <p className="text-[12px] text-ink/75 mt-1">This is the only time the full token is shown. If you lose it, revoke and create a new one.</p>
          <pre className="mt-3 bg-ink text-paper p-3 font-mono text-sm overflow-x-auto select-all break-all">{created}</pre>
        </div>
      ) : null}

      {/* Create form */}
      <div className="mt-8 card-frame">
        <NewKeyForm />
      </div>

      {/* List */}
      <h2 className="text-sm font-semibold mt-10 mb-3">Active keys</h2>
      <div className="bg-bone border border-ink/15 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-ink/65">
            <tr>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Name</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Prefix</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Scopes</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Last used</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Created</th>
              <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink/55">No API keys yet — create one above.</td></tr>
            ) : keys.map((k) => (
              <tr key={k.id} className={`border-t border-ink/10 ${k.revokedAt ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium">{k.name}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink/70">{k.prefix}…</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.split(",").filter(Boolean).map((s) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 border border-ink/20 bg-cream tracking-[0.06em] uppercase font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink/65">{k.lastUsedAt ? k.lastUsedAt.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                <td className="px-4 py-3 text-[12px] text-ink/65">{k.createdAt.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3 text-right">
                  {k.revokedAt ? (
                    <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-red-700">Revoked</span>
                  ) : (
                    <form action={revokeKey.bind(null, k.id)}>
                      <button className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 hover:text-red-600 underline">Revoke</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Docs link */}
      <div className="mt-10 card-frame">
        <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Usage</div>
        <p className="text-sm text-ink/80 mb-4">Set <code className="font-mono bg-cream px-1.5 py-0.5">Authorization: Bearer rs_live_…</code> on every request to <code className="font-mono bg-cream px-1.5 py-0.5">/api/v1/*</code>. Base URL: <code className="font-mono bg-cream px-1.5 py-0.5">https://radnarsupply.com</code></p>
        <details className="text-[13px]">
          <summary className="cursor-pointer font-display font-bold uppercase tracking-tight">Endpoints</summary>
          <ul className="mt-3 space-y-1.5 font-mono text-[12px] text-ink/80">
            <li><span className="text-accent font-bold">GET</span> /api/v1/products — list products (paginated)</li>
            <li><span className="text-accent font-bold">GET</span> /api/v1/products/[slug] — single product</li>
            <li><span className="text-accent font-bold">GET</span> /api/v1/inventory — list all variant SKUs + stock</li>
            <li><span className="text-accent font-bold">PATCH</span> /api/v1/inventory — bulk stock update (body: {`{ updates: [{ sku, stock }, …] }`})</li>
            <li><span className="text-accent font-bold">GET</span> /api/v1/orders — list orders (paginated, ?status=PAID)</li>
            <li><span className="text-accent font-bold">GET</span> /api/v1/orders/[number] — single order</li>
            <li><span className="text-accent font-bold">PATCH</span> /api/v1/orders/[number] — update status (body: {`{ status: "SHIPPED" }`})</li>
            <li><span className="text-accent font-bold">GET</span> /api/v1/customers — list customers (paginated)</li>
          </ul>
        </details>
      </div>

      <div className="mt-10 text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 flex items-center gap-2">
        <Icon.settings className="text-ink/40" /> Available scopes: {SCOPES.map((s) => s.id).join(", ")}
      </div>
    </div>
  );
}
