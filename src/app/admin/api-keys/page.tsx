import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NewKeyForm } from "./NewKeyForm";
import { revokeKey } from "./actions";
import {
  PageHeader, Card, Button, SectionTitle, TableWrap, Table, THead, Th, Tr, Td,
  Badge, EmptyState, Eyebrow, Ident,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://radnarsupply.com";

export default async function ApiKeys({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { created } = await searchParams;
  const keys = await db.apiKey.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="API keys"
        description="Keys for connecting SyncLayer, or any other system, to Radnar Supply."
      />

      {created ? (
        <div className="mb-8 rounded-card border border-accent/40 bg-accent/[0.07] p-5">
          <Eyebrow className="text-accent">Copy this now</Eyebrow>
          <p className="text-[13px] text-muted mt-1.5">
            This is the only time the full token is shown. If you lose it, revoke the key and create another.
          </p>
          <pre className="mt-3 rounded-control bg-ink text-paper p-3 font-mono text-[13px] overflow-x-auto select-all break-all">{created}</pre>
        </div>
      ) : null}

      {/* Connection details */}
      <section className="mb-8">
        <SectionTitle>Connection details</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Eyebrow>Base URL</Eyebrow>
            <code className="block mt-2 rounded-control bg-cream/70 border border-line/70 px-3 py-2 font-mono text-[13px] break-all select-all">
              {`${SITE}/api/sync`}
            </code>
          </Card>
          <Card>
            <Eyebrow>Auth type</Eyebrow>
            <code className="block mt-2 rounded-control bg-cream/70 border border-line/70 px-3 py-2 font-mono text-[13px]">
              Bearer token
            </code>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {[
            { h: "Products",  l: "GET /products"  },
            { h: "Inventory", l: "GET /inventory" },
            { h: "Orders",    l: "GET /orders"    },
          ].map((e) => (
            <Card key={e.h}>
              <Eyebrow>{e.h}</Eyebrow>
              <code className="block mt-2 font-mono text-[13px]">{e.l}</code>
            </Card>
          ))}
        </div>
      </section>

      {/* Scopes */}
      <section className="mb-8">
        <SectionTitle>Available scopes</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <ScopeCard
            title="Read" desc="View products, inventory levels and orders"
            endpoints={[
              "GET /api/sync/products",
              "GET /api/sync/products/:id",
              "GET /api/sync/inventory",
              "GET /api/sync/orders",
            ]}
          />
          <ScopeCard
            title="Write" desc="Create or update products and set inventory levels"
            endpoints={[
              "POST /api/sync/products",
              "PUT /api/sync/products/:id",
              "POST /api/sync/inventory/set",
              "POST /api/sync/webhooks",
            ]}
          />
          <ScopeCard
            title="Delete" desc="Remove products from the catalogue"
            endpoints={["DELETE /api/sync/products/:id"]}
          />
        </div>
      </section>

      {/* Create form */}
      <section className="mb-8">
        <SectionTitle>Create a key</SectionTitle>
        <Card className="max-w-2xl">
          <NewKeyForm />
        </Card>
      </section>

      {/* Active keys */}
      <section className="mb-8">
        <SectionTitle>Keys</SectionTitle>
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Name</Th><Th>Prefix</Th><Th>Scopes</Th>
                <Th>Last used</Th><Th>Created</Th><Th align="right" />
              </tr>
            </THead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <Td colSpan={6}>
                    <EmptyState title="No keys yet" hint="Create one above to connect an external system." />
                  </Td>
                </tr>
              ) : keys.map((k) => (
                <Tr key={k.id} className={k.revokedAt ? "opacity-55" : ""}>
                  <Td className="font-medium">{k.name}</Td>
                  <Td><Ident>{k.prefix}…</Ident></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.split(",").filter(Boolean).map((s) => (
                        <Badge key={s} tone="neutral" dot={false}>{s}</Badge>
                      ))}
                    </div>
                  </Td>
                  <Td className="text-muted text-[12px] whitespace-nowrap">
                    {k.lastUsedAt
                      ? k.lastUsedAt.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </Td>
                  <Td className="text-muted text-[12px] whitespace-nowrap">
                    {k.createdAt.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Td>
                  <Td align="right">
                    {k.revokedAt ? (
                      <Badge tone="danger">Revoked</Badge>
                    ) : (
                      <form action={revokeKey.bind(null, k.id)}>
                        <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger-tint">
                          Revoke
                        </Button>
                      </form>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </section>

      {/* Webhooks */}
      <section>
        <SectionTitle>Webhooks</SectionTitle>
        <Card>
          <p className="text-sm text-muted">
            With a <code className="font-mono text-[12px] bg-cream/70 px-1.5 py-0.5 rounded">write</code>-scoped key,
            an external system can subscribe to store events:
          </p>
          <pre className="mt-3 rounded-control bg-ink text-paper p-3 font-mono text-[12px] overflow-x-auto">{`POST ${SITE}/api/sync/webhooks
{
  "url": "https://synclayer.app/webhooks/radnar",
  "events": ["order.paid", "order.shipped", "product.updated", "inventory.changed"]
}`}</pre>
          <p className="text-[12px] text-muted mt-2.5">
            Event POSTs are signed with{" "}
            <code className="font-mono">X-Radnar-Signature: sha256=&lt;hex&gt;</code>. The signing secret is
            returned only when the subscription is created.
          </p>
        </Card>
      </section>
    </div>
  );
}

function ScopeCard({ title, desc, endpoints }: { title: string; desc: string; endpoints: string[] }) {
  return (
    <Card>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="text-[13px] text-muted mt-1">{desc}</div>
      <ul className="mt-3.5 space-y-1.5">
        {endpoints.map((e) => (
          <li key={e}>
            <code className="block rounded-[6px] bg-cream/70 border border-line/60 px-2 py-1 font-mono text-[12px] break-all">
              {e}
            </code>
          </li>
        ))}
      </ul>
    </Card>
  );
}
