import Link from "next/link";

export default function Cancelled() {
  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-24 text-center">
      <div className="text-[11px] tracking-[0.22em] uppercase text-muted">Cancelled</div>
      <h1 className="mt-3 text-3xl md:text-4xl font-display font-semibold tracking-tightest">Payment cancelled.</h1>
      <p className="mt-3 text-muted">No charge taken. Your bag is still here.</p>
      <Link href="/cart" className="mt-8 inline-block bg-ink text-white px-6 py-3 rounded-full text-sm font-medium">Back to bag</Link>
    </div>
  );
}
