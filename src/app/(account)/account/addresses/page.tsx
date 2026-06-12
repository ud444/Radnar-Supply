import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function Addresses() {
  const user = await requireUser();
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: { id: "desc" } });

  async function add(fd: FormData) {
    "use server";
    const u = await requireUser();
    await db.address.create({
      data: {
        userId: u.id,
        name:     String(fd.get("name")),
        line1:    String(fd.get("line1")),
        line2:    fd.get("line2") ? String(fd.get("line2")) : null,
        city:     String(fd.get("city")),
        postcode: String(fd.get("postcode")),
        phone:    fd.get("phone") ? String(fd.get("phone")) : null,
      },
    });
    revalidatePath("/account/addresses");
  }
  async function remove(id: string) {
    "use server";
    const u = await requireUser();
    await db.address.deleteMany({ where: { id, userId: u.id } });
    revalidatePath("/account/addresses");
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Addresses</h1>
      <ul className="mt-6 grid md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <li key={a.id} className="border border-line rounded p-5 text-sm">
            <div className="font-medium">{a.name}</div>
            <div className="text-muted mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br/>{a.city}, {a.postcode}<br/>{a.country}</div>
            <form action={remove.bind(null, a.id)}>
              <button className="mt-3 text-xs underline text-muted">Remove</button>
            </form>
          </li>
        ))}
      </ul>

      <form action={add} className="mt-10 border border-line rounded p-5 grid md:grid-cols-2 gap-3 max-w-2xl">
        <h2 className="md:col-span-2 text-sm font-medium">Add address</h2>
        <input name="name"     required placeholder="Full name"        className="border border-line rounded px-3 py-2 text-sm md:col-span-2" />
        <input name="line1"    required placeholder="Address"          className="border border-line rounded px-3 py-2 text-sm md:col-span-2" />
        <input name="line2"             placeholder="Address line 2"   className="border border-line rounded px-3 py-2 text-sm md:col-span-2" />
        <input name="city"     required placeholder="City"             className="border border-line rounded px-3 py-2 text-sm" />
        <input name="postcode" required placeholder="Postcode"         className="border border-line rounded px-3 py-2 text-sm" />
        <input name="phone"             placeholder="Phone (optional)" className="border border-line rounded px-3 py-2 text-sm md:col-span-2" />
        <button className="md:col-span-2 bg-ink text-white py-2.5 rounded-full text-sm">Add address</button>
      </form>
    </div>
  );
}
