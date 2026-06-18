import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await db.sourcingRequest.findUnique({ where: { id } });
  if (!r) notFound();

  let images: string[] = [];
  try { const p = JSON.parse(r.imageUrls); if (Array.isArray(p)) images = p; } catch {}

  async function save(fd: FormData) {
    "use server";
    await requireAdmin();
    await db.sourcingRequest.update({
      where: { id },
      data: {
        status: String(fd.get("status")) as any,
        notes: String(fd.get("notes") || "") || null,
      },
    });
    revalidatePath(`/admin/requests/${id}`);
    revalidatePath("/admin/requests");
  }

  const field = (label: string, value?: string | null) =>
    value ? (
      <div>
        <div className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">{label}</div>
        <div className="text-sm mt-1 whitespace-pre-wrap">{value}</div>
      </div>
    ) : null;

  return (
    <div className="max-w-4xl">
      <Link href="/admin/requests" className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">← All requests</Link>
      <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-3xl uppercase tracking-tightest">{r.name}</h1>
            <StatusBadge value={r.status} />
          </div>
          <div className="text-sm text-ink/55 mt-1">
            {r.type === "PRIVATE" ? "RADNAR Private" : "Personal Shopping"} · {r.createdAt.toLocaleString("en-GB")}
          </div>
        </div>
        <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your Radnar Supply request: ${r.item}`)}`}
           className="bg-ink text-paper px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
          Reply by email →
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 bg-white border border-line p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {field("Email", r.email)}
            {field("Phone", r.phone)}
            {field("Size", r.size)}
            {field("Budget", r.budget)}
          </div>
          {field("Item", r.item)}
          {field("Detail", r.detail)}
          {images.length > 0 ? (
            <div>
              <div className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold mb-2">Reference images</div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((u) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="aspect-square object-cover bg-soft border border-line" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <form action={save} className="bg-white border border-line p-6 space-y-4 h-fit">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold mb-1">Status</div>
            <select name="status" defaultValue={r.status} className="w-full border border-line px-3 py-2 text-sm">
              {["NEW", "IN_PROGRESS", "SOURCED", "CLOSED"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold mb-1">Internal notes</div>
            <textarea name="notes" rows={6} defaultValue={r.notes ?? ""} className="w-full border border-line px-3 py-2 text-sm" placeholder="Sourcing progress, supplier quotes, next steps…" />
          </div>
          <button className="bg-ink text-white py-3 text-sm font-medium w-full">Save</button>
        </form>
      </div>
    </div>
  );
}
