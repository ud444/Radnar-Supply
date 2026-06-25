import Link from "next/link";
import { money } from "@/lib/format";

type Props = {
  slug: string; name: string;
  brand: { name: string };
  priceCents: number;
  images: { url: string; alt: string | null }[];
};

export function ProductCard({ slug, name, brand, priceCents, images }: Props) {
  const cover = images[0]?.url ?? "";
  const hover = images[1]?.url ?? cover;
  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-cream overflow-hidden hover-lift rounded-2xl">
        {cover && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={name} className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 group-hover:opacity-0 group-hover:scale-[1.03]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hover} alt="" className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        )}
        {/* Hover overlay with action */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-ink text-paper py-3 text-center text-[11px] tracking-[0.2em] uppercase font-bold">
          View Product →
        </div>
        {/* Corner accent ribbon */}
        <div className="absolute top-3 left-3 bg-paper text-ink px-2 py-1 text-[9px] tracking-[0.22em] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {brand.name}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display font-black text-[15px] uppercase tracking-tight leading-none text-ink group-hover:text-accent transition-colors">
            {brand.name}
          </div>
          <div className="text-[13px] mt-1.5 text-ink/85 line-clamp-1">{name}</div>
        </div>
        <div className="text-[13px] font-display font-black whitespace-nowrap mt-0.5">{money(priceCents)}</div>
      </div>
    </Link>
  );
}
