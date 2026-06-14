import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function Addresses() {
  const user = await requireUser();
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  async function add(fd: FormData) {
    "use server";
    const u = await requireUser();
    const isFirst = (await db.address.count({ where: { userId: u.id } })) === 0;
    await db.address.create({
      data: {
        userId:   u.id,
        name:     String(fd.get("name")),
        line1:    String(fd.get("line1")),
        line2:    fd.get("line2") ? String(fd.get("line2")) : null,
        city:     String(fd.get("city")),
        postcode: String(fd.get("postcode")),
        phone:    fd.get("phone") ? String(fd.get("phone")) : null,
        isDefault: isFirst,
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
  async function setDefault(id: string) {
    "use server";
    const u = await requireUser();
    await db.$transaction([
      db.address.updateMany({ where: { userId: u.id }, data: { isDefault: false } }),
      db.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
    revalidatePath("/account/addresses");
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow-lead">Account · Addresses</div>
          <h1 className="mt-2 font-display font-black text-4xl md:text-6xl uppercase display-tight">Where it ships.</h1>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="card-frame mt-10 text-center py-12">
          <div className="font-display font-black uppercase text-2xl tracking-tight">No addresses saved.</div>
          <p className="text-sm text-ink/65 mt-2">Add one below for faster checkout next time.</p>
        </div>
      ) : (
        <ul className="mt-10 grid md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <li key={a.id} className={`card relative ${a.isDefault ? "border-ink border-2" : ""}`}>
              {a.isDefault ? (
                <span className="absolute top-3 right-3 bg-accent text-paper px-2 py-1 text-[10px] tracking-[0.18em] uppercase font-bold">Default</span>
              ) : null}
              <div className="num-mark">·</div>
              <div className="font-display font-black uppercase text-lg tracking-tight mt-1">{a.name}</div>
              <div className="text-sm text-ink/75 mt-2">
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br/>
                {a.city}, {a.postcode}<br/>
                {a.country}
              </div>
              {a.phone ? <div className="text-[12px] text-ink/55 mt-2">{a.phone}</div> : null}
              <div className="mt-4 flex gap-4 text-[11px] tracking-[0.18em] uppercase font-bold">
                {!a.isDefault ? (
                  <form action={setDefault.bind(null, a.id)}>
                    <button className="underline hover:text-accent">Set as default</button>
                  </form>
                ) : null}
                <form action={remove.bind(null, a.id)} className="ml-auto">
                  <button className="text-ink/55 hover:text-red-600 underline">Remove</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add new */}
      <div className="mt-12">
        <div className="eyebrow-lead mb-4">Add Address</div>
        <form action={add} className="card-frame max-w-2xl grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2 field">
            <label className="field-label">Full name</label>
            <input name="name" required className="field-input" />
          </div>
          <div className="md:col-span-2 field">
            <label className="field-label">Address</label>
            <input name="line1" required className="field-input" />
          </div>
          <div className="md:col-span-2 field">
            <label className="field-label">Apartment, suite, etc. (optional)</label>
            <input name="line2" className="field-input" />
          </div>
          <div className="field">
            <label className="field-label">City</label>
            <input name="city" required className="field-input" />
          </div>
          <div className="field">
            <label className="field-label">Postcode</label>
            <input name="postcode" required className="field-input" />
          </div>
          <div className="md:col-span-2 field">
            <label className="field-label">Phone (optional)</label>
            <input name="phone" type="tel" className="field-input" />
          </div>
          <button className="md:col-span-2 btn">Add address →</button>
        </form>
      </div>
    </div>
  );
}
