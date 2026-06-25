"use client";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";

type Img = { id: string; url: string; alt: string | null };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const count = images.length;
  const go = useCallback((dir: number) => setActive((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, count]);

  if (count === 0) {
    return <div className="aspect-square bg-cream grid place-items-center text-ink/20 font-display font-black text-3xl uppercase">Radnar</div>;
  }

  const current = images[active];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
      {/* Thumbnails */}
      {count > 1 ? (
        <div className="flex md:flex-col gap-2.5 md:w-[84px] shrink-0 overflow-x-auto md:overflow-visible no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative shrink-0 w-[68px] h-[84px] md:w-full md:h-[100px] bg-cream overflow-hidden border-2 rounded-xl transition-colors ${
                i === active ? "border-ink" : "border-transparent hover:border-ink/30"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="84px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Main image */}
      <div className="relative flex-1 aspect-[4/5] bg-cream overflow-hidden group select-none rounded-2xl shadow-card">
        <Image
          src={current.url}
          alt={current.alt ?? name}
          fill priority sizes="(max-width: 768px) 100vw, 55vw"
          className="object-contain p-6 md:p-10"
        />

        {/* Counter */}
        <div className="absolute top-3 left-3 bg-paper/90 backdrop-blur text-ink px-2 py-1 text-[9px] tracking-[0.22em] uppercase font-bold">
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </div>

        {/* Prev / next */}
        {count > 1 ? (
          <>
            <button
              type="button" onClick={() => go(-1)} aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center bg-paper/90 backdrop-blur text-ink hover:bg-ink hover:text-paper transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button" onClick={() => go(1)} aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center bg-paper/90 backdrop-blur text-ink hover:bg-ink hover:text-paper transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Chevron dir="right" />
            </button>

            {/* Dots (mobile-friendly) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {images.map((img, i) => (
                <span key={img.id} className={`w-1.5 h-1.5 ${i === active ? "bg-ink" : "bg-ink/25"}`} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}
