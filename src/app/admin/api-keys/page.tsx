import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { SCOPES } from "@/lib/apiKey";
import { NewKeyForm } from "./NewKeyForm";
import { revokeKey } from "./actions";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://radnarsupply.com";

export default async function ApiKeys({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { created } = await searchParams;
  const keys = await db.apiKey.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      {/* Header */}
      <div>
        <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Integrations</div>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">SyncLayer Integration</h1>
        <p className="text-sm text-ink/65 mt-2 max-w-prose">
          Manage API keys for connecting SyncLayer to Radnar Supply.
        </p>
      </div>

      {/* New key reveal */}
      {created ? (
        <div className="mt-8 border-2 border-accent bg-accent/10 p-5">
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-accent">New Key — Copy Now</div>
          <p className="text-[12px] text-ink/75 mt-1">This is the only time the full token is shown. If you lose it, revoke and create a new one.</p>
          <pre className="mt-3 bg-ink text-paper p-3 font-mono text-sm overflow-x-auto select-all break-all">{created}</pre>
        </div>
      ) : null}

      {/* Connection details panel */}
      <section className="mt-10">
        <h2 className="font-display font-bold uppercase text-xl tracking-tight">Connection Details</h2>
        <p className="text-sm text-ink/65 mt-1.5">
          Use these settings when adding <strong>Radnar Supply</strong> as a Custom Store in SyncLayer.
        </p>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div className="card">
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Base URL</div>
            <code className="block mt-2 font-mono text-sm bg-cream px-3 py-2 border border-ink/15 break-all select-all">{`${SITE}/api/sync`}</code>
          </div>
          <div className="card">
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Auth Type</div>
            <code className="block mt-2 font-mono text-sm bg-cream px-3 py-2 border border-ink/15">Bearer Token</code>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-4">
          {[
            { h: "Products",  l: "GET /products"  },
            { h: "Inventory", l: "GET /inventory" },
            { h: "Orders",    l: "GET /orders"    },
          ].map((e) => (
            <div key={e.h} className="card">
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">{e.h}</div>
              <code className="block mt-2 font-mono text-sm">{e.l}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Scopes */}
      <section className="mt-12">
        <h2 className="font-display font-bold uppercase text-xl tracking-tight">Available Scopes</h2>
        <p className="text-sm text-ink/65 mt-1.5">
          Each API key can be assigned one or more scopes that control access.
        </p>

        <div className="mt-5 grid md:grid-cols-3 gap-4">
          <ScopeCard title="Read" desc="View products, inventory levels, and orders" endpoints={[
            "GET /api/sync/products",
            "GET /api/sync/products/:id",
            "GET /api/sync/inventory",
            "GET /api/sync/orders",
          ]} />
          <ScopeCard title="Write" desc="Create / update products and set inventory levels" endpoints={[
            "POST /api/sync/products",
            "PUT /api/sync/products/:id",
            "POST /api/sync/inventory/set",
            "POST /api/sync/webhooks",
          ]} />
          <ScopeCard title="Delete" desc="Remove products from the catalogue" endpoints={[
            "DELETE /api/sync/products/:id",
          ]} />
        </div>
      </section>

      {/* Create form */}
      <section className="mt-12">
        <h2 className="font-display font-bold uppercase text-xl tracking-tight">Create API Key</h2>
        <div className="mt-4 card-frame max-w-2xl">
          <NewKeyForm />
        </div>
      </section>

      {/* Active keys list */}
      <section className="mt-12">
        <h2 className="font-display font-bold uppercase text-xl tracking-tight mb-3">Active Keys</h2>
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
                <tr><td colSpan={6} className="px-4 py-12 text-center text-ink/55">No keys yet — create one above.</td></tr>
              ) : keys.map((k) => (
                <tr key={k.id} className={`border-t border-ink/10 ${k.revokedAt ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink/70">{k.prefix}…</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.split(",").filter(Boolean).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 border border-ink/20 bg-cream tracking-[0.06em] uppercase font-bold">{s}</span>
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
      </section>

      {/* Webhook quick note */}
      <section className="mt-12 card">
        <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Webhooks</div>
        <p className="text-sm text-ink/75 mt-2">
          With a <code className="font-mono bg-cream px-1.5 py-0.5">write</code>-scoped key, SyncLayer can subscribe to store events with:
        </p>
        <pre className="mt-3 bg-ink text-paper p-3 font-mono text-[12px] overflow-x-auto">{`POST ${SITE}/api/sync/webhooks
{
  "url": "https://synclayer.app/webhooks/radnar",
  "events": ["order.paid", "order.shipped", "product.updated", "inventory.changed"]
}`}</pre>
        <p className="text-[11px] text-ink/55 mt-2">
          Event POSTs are signed with <code className="font-mono">X-Radnar-Signature: sha256=&lt;hex&gt;</code>. The signing secret is returned only on subscription creation.
        </p>
      </section>
    </div>
  );
}

function ScopeCard({ title, desc, endpoints }: { title: string; desc: string; endpoints: string[] }) {
  return (
    <div className="card-frame">
      <div className="font-display font-black text-2xl uppercase tracking-tight">{title}</div>
      <div className="text-sm text-ink/70 mt-1.5">{desc}</div>
      <ul className="mt-4 space-y-1.5">
        {endpoints.map((e) => (
          <li key={e}><code className="font-mono text-[12px] block bg-cream px-2 py-1 border border-ink/10">{e}</code></li>
        ))}
      </ul>
    </div>
  );
}
