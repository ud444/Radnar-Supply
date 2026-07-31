import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  PageHeader, Toolbar, FilterTabs, TableWrap, Table, THead, Th, Tr, Td,
  EmptyState, Badge,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  await requireAdmin();
  const { status, type } = await searchParams;

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(type ? { type: type as any } : {}),
  };

  const [requests, newCount] = await Promise.all([
    db.sourcingRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    db.sourcingRequest.count({ where: { status: "NEW" } }),
  ]);

  const filters = [
    { label: "All",         href: "/admin/requests",                     active: !status && !type },
    { label: "New",         href: "/admin/requests?status=NEW",          active: status === "NEW" },
    { label: "In progress", href: "/admin/requests?status=IN_PROGRESS",  active: status === "IN_PROGRESS" },
    { label: "Quoted",      href: "/admin/requests?status=QUOTED",       active: status === "QUOTED" },
    { label: "Sourced",     href: "/admin/requests?status=SOURCED",      active: status === "SOURCED" },
    { label: "Private",     href: "/admin/requests?type=PRIVATE",        active: type === "PRIVATE" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Personal shopping"
        title="Requests"
        actions={newCount > 0 ? <Badge tone="accent">{newCount} new</Badge> : undefined}
      />

      <Toolbar>
        <FilterTabs items={filters} />
      </Toolbar>

      <TableWrap>
        <Table>
          <THead>
            <tr>
              <Th>Received</Th><Th>Name</Th><Th>Item</Th><Th>Type</Th><Th>Status</Th>
            </tr>
          </THead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <Td colSpan={5}>
                  <EmptyState
                    title={status || type ? "No requests match" : "No requests yet"}
                    hint={
                      status || type
                        ? "Try a different filter."
                        : "Sourcing and personal-shopping enquiries land here as customers submit them."
                    }
                  />
                </Td>
              </tr>
            ) : requests.map((r) => (
              <Tr key={r.id}>
                <Td className="text-muted whitespace-nowrap">{r.createdAt.toLocaleDateString("en-GB")}</Td>
                <Td>
                  <Link href={`/admin/requests/${r.id}`} className="font-medium hover:text-accent transition-colors">
                    {r.name}
                  </Link>
                  <div className="text-[12px] text-muted">{r.email}</div>
                </Td>
                <Td className="max-w-xs"><div className="line-clamp-1">{r.item}</div></Td>
                <Td>
                  <Badge tone={r.type === "PRIVATE" ? "accent" : "neutral"} dot={false}>
                    {r.type === "PRIVATE" ? "Private" : "Standard"}
                  </Badge>
                </Td>
                <Td><StatusBadge value={r.status} /></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
