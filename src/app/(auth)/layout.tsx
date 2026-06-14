import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12">
      {/* Brand panel — left */}
      <aside className="lg:col-span-5 xl:col-span-4 bg-ink text-paper p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/radnar-mark-light.png" alt="Radnar Supply" width={1600} height={593} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/60 hover:text-accent">
            ← Back to Shop
          </Link>
        </div>

        <div className="my-16">
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55">Members Only</div>
          <h1 className="mt-3 font-display font-black text-5xl md:text-7xl uppercase display-tight">
            Verified.<br/>
            <span className="text-accent">Below retail.</span><br/>
            Always.
          </h1>
          <p className="mt-6 max-w-sm text-paper/70 text-sm leading-relaxed">
            Sign in to see your orders, save addresses, and unlock 10% off your next drop.
          </p>
        </div>

        <ul className="space-y-3 text-[12px] tracking-[0.04em] text-paper/85">
          {[
            "Track orders + return shortcuts",
            "Save shipping addresses",
            "Drop alerts before public release",
            "10% members-only welcome code",
          ].map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-accent" />
              {b}
            </li>
          ))}
        </ul>

        {/* Decorative number watermark */}
        <div aria-hidden className="absolute -right-10 -bottom-10 text-paper/[0.04] font-display font-black text-[18rem] leading-none pointer-events-none select-none">RS</div>
      </aside>

      {/* Form panel — right */}
      <main className="lg:col-span-7 xl:col-span-8 bg-paper flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
