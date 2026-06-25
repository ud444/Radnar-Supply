import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-32">
        <div className="rule-eyebrow">404</div>
        <h1 className="mt-6 font-display font-black text-7xl md:text-[12rem] uppercase display-tight">
          Out of <span className="text-accent">stock.</span>
        </h1>
        <p className="mt-8 max-w-md text-[15px] text-ink/75 leading-relaxed">
          We couldn't find what you were after. The link may be old, or the piece may have sold out.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-[10px]">Home →</Link>
          <Link href="/shop" className="border-2 border-ink text-ink px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-ink hover:text-paper transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-[10px]">Shop Everything</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
