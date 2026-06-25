import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

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
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Moderation</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Reviews</h1>
      <p className="mt-3 text-sm text-ink/65">{pending} awaiting approval · approved reviews show on the storefront.</p>

      <div className="mt-6 bg-bone border border-ink/15 overflow-hidden rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-cream text-ink/65">
            <tr>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Product</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Review</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Status</th>
              <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-ink/55">No reviews yet.</td></tr>
            ) : reviews.map((r) => (
              <tr key={r.id} className="border-t border-ink/10 align-top">
                <td className="px-4 py-3">
                  <Link href={`/product/${r.product.slug}`} className="hover:text-accent font-medium">{r.product.name}</Link>
                  <div className="text-xs text-ink/45 mt-0.5">{r.createdAt.toLocaleDateString("en-GB")}</div>
                </td>
                <td className="px-4 py-3 max-w-md">
                  <div className="text-accent">{"★".repeat(r.rating)}<span className="text-ink/20">{"★".repeat(5 - r.rating)}</span></div>
                  <div className="font-bold text-xs mt-1">{r.author}</div>
                  <div className="text-ink/75 mt-0.5">{r.body}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {r.status === "PENDING" ? (
                    <form action={approve} className="inline">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-[11px] tracking-[0.16em] uppercase font-bold text-green-700 hover:text-green-900 mr-3">Approve</button>
                    </form>
                  ) : null}
                  <form action={remove} className="inline">
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-[11px] tracking-[0.16em] uppercase font-bold text-red-600 hover:text-red-800">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
