import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  PageHeader, Button, TableWrap, Table, THead, Th, Tr, Td, EmptyState, Badge,
} from "@/components/admin/ui";

async function approve(fd: FormData) {
  "use server";
  await requireAdmin();
  const r = await db.review.update({ where: { id: String(fd.get("id")) }, data: { status: "APPROVED" }, include: { product: { select: { slug: true } } } });
  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${r.product.slug}`);
}
async function remove(fd: FormData) {
  "use server";
  await requireAdmin();
  const r = await db.review.findUnique({ where: { id: String(fd.get("id")) }, include: { product: { select: { slug: true } } } });
  await db.review.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/reviews");
  if (r) revalidatePath(`/product/${r.product.slug}`);
}

export default async function AdminReviews() {
  await requireAdmin();
  const reviews = await db.review.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }], // PENDING before APPROVED
    take: 200,
    include: { product: { select: { name: true, slug: true } } },
  });
  const pending = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Reviews"
        description="Approved reviews appear on the storefront. Pending ones are hidden until you approve them."
        actions={pending > 0 ? <Badge tone="accent">{pending} awaiting approval</Badge> : undefined}
      />

      <TableWrap>
        <Table>
          <THead>
            <tr>
              <Th>Product</Th><Th>Review</Th><Th>Status</Th><Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <Td colSpan={4}>
                  <EmptyState
                    title="No reviews yet"
                    hint="Customer reviews land here for approval before they go live."
                  />
                </Td>
              </tr>
            ) : reviews.map((r) => (
              <Tr key={r.id} className="align-top">
                <Td>
                  <Link href={`/product/${r.product.slug}`} className="font-medium hover:text-accent transition-colors">
                    {r.product.name}
                  </Link>
                  <div className="text-[12px] text-muted mt-0.5">{r.createdAt.toLocaleDateString("en-GB")}</div>
                </Td>
                <Td className="max-w-md">
                  <div className="text-accent tracking-[0.1em]" aria-label={`${r.rating} out of 5`}>
                    {"★".repeat(r.rating)}<span className="text-muted/30">{"★".repeat(5 - r.rating)}</span>
                  </div>
                  <div className="font-medium text-[13px] mt-1">{r.author}</div>
                  <div className="text-muted mt-0.5">{r.body}</div>
                </Td>
                <Td><StatusBadge value={r.status} /></Td>
                <Td align="right" className="whitespace-nowrap">
                  <div className="inline-flex gap-1.5">
                    {r.status === "PENDING" ? (
                      <form action={approve}>
                        <input type="hidden" name="id" value={r.id} />
                        <Button
                          variant="ghost" size="sm"
                          className="text-success hover:text-success hover:bg-success-tint"
                        >
                          Approve
                        </Button>
                      </form>
                    ) : null}
                    <form action={remove}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button
                        variant="ghost" size="sm"
                        className="text-danger hover:text-danger hover:bg-danger-tint"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
