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
      <div className="relative aspect-[4/5] bg-soft overflow-hidden rounded">
        {cover && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        )}
      </div>
      <div className="mt-3">
        <div className="text-[10px] tracking-[0.18em] uppercase text-muted">{brand.name}</div>
        <div className="text-sm mt-0.5 line-clamp-1">{name}</div>
        <div className="mt-1 text-sm font-medium">{money(priceCents)}</div>
      </div>
    </Link>
  );
}
