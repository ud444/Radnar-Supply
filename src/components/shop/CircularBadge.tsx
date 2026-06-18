/**
 * Circular text seal. Uses SVG (the global `border-radius: 0` reset rules out
 * CSS circles). Rotates slowly via the `.badge-spin` keyframes in globals.css.
 */
export function CircularBadge({
  text = "SOURCE · SUPPLY · PERSONAL SHOP · ",
  className = "",
  size = 120,
  spin = true,
  center = "✦",
}: {
  text?: string;
  className?: string;
  size?: number;
  spin?: boolean;
  center?: string;
}) {
  return (
    <div
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        className={spin ? "badge-spin w-full h-full" : "w-full h-full"}
      >
        <defs>
          <path id="badge-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current" style={{ fontSize: 9.2, letterSpacing: "0.18em", fontWeight: 700 }}>
          <textPath href="#badge-circle" startOffset="0">
            {text.repeat(2)}
          </textPath>
        </text>
      </svg>
      <span className="absolute font-display font-black text-lg leading-none text-accent">{center}</span>
    </div>
  );
}
