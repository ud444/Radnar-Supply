import Link from "next/link";
import clsx from "clsx";

/**
 * Shared admin UI primitives.
 *
 * Voice: the admin is the back room, not the shop floor. The storefront's
 * editorial register (huge uppercase display slabs, letterspaced caps on every
 * control) is deliberately NOT used here — in a tool you sit in for hours,
 * emphasising everything means emphasising nothing.
 *
 * Three faces, each tied to a kind of data:
 *   display → quantities   (money, counts — the numbers are the content)
 *   mono    → identifiers  (order numbers, slugs, SKUs, keys)
 *   sans    → everything else, sentence case
 *
 * Uppercase survives only for true labels: eyebrows and column headers.
 *
 * All server-safe — no client hooks — so these drop into RSC pages directly.
 */

/* ---------------------------------------------------------------- focus ring */

const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 " +
  "focus-visible:ring-offset-1 focus-visible:ring-offset-paper";

/* --------------------------------------------------------------- typography */

/** A quantity. The display face earns its keep only on numbers. */
export function Num({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={clsx("font-display font-black tabular-nums", className)}>{children}</span>;
}

/** An identifier — order number, slug, SKU, key. */
export function Ident({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={clsx("font-mono text-[12px] text-muted", className)}>{children}</span>;
}

/** Small uppercase label. One of only two places caps are allowed. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("text-[10px] tracking-[0.18em] uppercase font-semibold text-muted", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ buttons */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-ink text-paper border border-ink hover:bg-accent hover:border-accent",
  secondary: "bg-bone text-ink border border-ink/20 hover:border-ink/60 hover:bg-cream/60",
  ghost:     "bg-transparent text-muted border border-transparent hover:text-ink hover:bg-cream/70",
  danger:    "bg-bone text-danger border border-danger/30 hover:bg-danger hover:text-bone hover:border-danger",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[12px] gap-1.5",
  md: "h-9 px-3.5 text-[13px] gap-2",
};

export function btn(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(
    "inline-flex items-center justify-center rounded-control font-medium",
    "transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none",
    VARIANTS[variant], SIZES[size], RING, className,
  );
}

export function Button({
  variant = "primary", size = "md", className, children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={btn(variant, size, className)} {...rest}>{children}</button>;
}

export function ButtonLink({
  href, variant = "primary", size = "md", className, children, ...rest
}: { href: string; variant?: Variant; size?: Size; className?: string; children: React.ReactNode } &
   Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return <Link href={href} className={btn(variant, size, className)} {...rest}>{children}</Link>;
}

/* -------------------------------------------------------------- page header */

export function PageHeader({
  eyebrow, title, description, actions,
}: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 pb-5 mb-6 border-b border-line/70">
      <div className="min-w-0">
        {eyebrow ? <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow> : null}
        <h1 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.01em] leading-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted max-w-prose">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- cards */

export function Card({
  children, className, padded = true,
}: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={clsx(
      "bg-bone border border-line/70 rounded-card",
      "shadow-[0_1px_2px_rgba(10,10,10,0.03)]",
      padded && "p-5", className,
    )}>
      {children}
    </div>
  );
}

export function SectionTitle({
  children, action,
}: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------------- table */

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "bg-bone border border-line/70 rounded-card overflow-hidden",
      "shadow-[0_1px_2px_rgba(10,10,10,0.03)]", className,
    )}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm border-collapse">{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-cream/60 text-muted">{children}</thead>;
}

export function Th({
  children, align = "left", className,
}: { children?: React.ReactNode; align?: "left" | "right" | "center"; className?: string }) {
  return (
    <th className={clsx(
      "px-4 py-2.5 text-[10px] tracking-[0.14em] uppercase font-semibold whitespace-nowrap",
      align === "right" && "text-right", align === "left" && "text-left", align === "center" && "text-center",
      className,
    )}>
      {children}
    </th>
  );
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={clsx("border-t border-line/60 transition-colors hover:bg-cream/40", className)}>
      {children}
    </tr>
  );
}

export function Td({
  children, align = "left", numeric = false, className, colSpan,
}: {
  children?: React.ReactNode; align?: "left" | "right" | "center";
  numeric?: boolean; className?: string; colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={clsx(
      "px-4 py-3 align-middle",
      align === "right" && "text-right", align === "center" && "text-center",
      // Tabular figures stop prices and counts jittering as the eye scans down.
      numeric && "tabular-nums",
      className,
    )}>
      {children}
    </td>
  );
}

/* ------------------------------------------------------------------- badges */

export type Tone = "neutral" | "success" | "info" | "warning" | "danger" | "accent";

const TONES: Record<Tone, string> = {
  neutral: "bg-cream text-muted border-line",
  success: "bg-success-tint text-success border-success-line",
  info:    "bg-info-tint text-info border-info-line",
  warning: "bg-warning-tint text-warning border-warning-line",
  danger:  "bg-danger-tint text-danger border-danger-line",
  accent:  "bg-accent/10 text-accent border-accent/30",
};

export function Badge({
  tone = "neutral", children, dot = true, className,
}: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px]",
      "text-[11px] font-medium leading-none whitespace-nowrap",
      TONES[tone], className,
    )}>
      {dot ? <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" /> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- empty state */

export function EmptyState({
  title, hint, action, icon,
}: { title: string; hint?: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="px-6 py-16 text-center">
      {icon ? <div className="mb-3 flex justify-center text-ink/25">{icon}</div> : null}
      <div className="text-[15px] font-medium">{title}</div>
      {hint ? <p className="mt-1.5 text-sm text-muted max-w-sm mx-auto">{hint}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ toolbar */

export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("flex flex-wrap gap-2.5 items-center mb-5", className)}>{children}</div>;
}

export function FilterTabs({
  items,
}: { items: { href: string; label: string; active: boolean }[] }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-cream/70 border border-line/70 rounded-control">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className={clsx(
          "px-3 h-7 inline-flex items-center rounded-[6px] text-[12px] font-medium transition-colors", RING,
          it.active ? "bg-ink text-paper" : "text-muted hover:text-ink hover:bg-bone",
        )}>
          {it.label}
        </Link>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- pagination */

export function Pagination({
  page, pages, total, noun, hrefFor,
}: { page: number; pages: number; total: number; noun: string; hrefFor: (n: number) => string }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
      <div className="text-muted">
        <span className="tabular-nums">{total}</span> {noun} · page{" "}
        <span className="tabular-nums">{page}</span> of <span className="tabular-nums">{pages}</span>
      </div>
      <div className="flex gap-2">
        {page > 1 ? <ButtonLink href={hrefFor(page - 1)} variant="secondary" size="sm">← Previous</ButtonLink> : null}
        {page < pages ? <ButtonLink href={hrefFor(page + 1)} variant="secondary" size="sm">Next →</ButtonLink> : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- stat tile */

export function StatCard({
  label, value, delta, children,
}: { label: string; value: React.ReactNode; delta?: number | null; children?: React.ReactNode }) {
  const up = typeof delta === "number" && delta >= 0;
  return (
    <div className="bg-bone border border-line/70 rounded-card p-4 sm:p-5 flex flex-col">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
        <Num className="text-[28px] sm:text-[32px] leading-none">{value}</Num>
        {typeof delta === "number" ? (
          <span className={clsx(
            "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-[2px]",
            "text-[11px] font-medium leading-none tabular-nums",
            up ? "bg-success-tint text-success border-success-line"
               : "bg-danger-tint text-danger border-danger-line",
          )}>
            {up ? "↑" : "↓"}{Math.abs(delta)}%
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-auto">{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- inputs */

export function SearchInput({
  name = "q", defaultValue, placeholder, className,
}: { name?: string; defaultValue?: string; placeholder?: string; className?: string }) {
  return (
    <div className={clsx("relative", className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input
        name={name} defaultValue={defaultValue} placeholder={placeholder}
        className={clsx(
          "w-full h-9 bg-bone border border-ink/15 rounded-control pl-9 pr-3 text-sm",
          "placeholder:text-ink/35 transition-colors hover:border-ink/30",
          "focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25",
        )}
      />
    </div>
  );
}

/* -------------------------------------------------------------- form fields */

const CONTROL =
  "w-full bg-bone border border-ink/15 rounded-control px-3 text-sm text-ink " +
  "placeholder:text-ink/35 transition-colors hover:border-ink/30 " +
  "focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25 " +
  "disabled:opacity-50 disabled:pointer-events-none";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block mb-1.5">
      <span className="text-[12px] font-medium text-ink">{children}</span>
      {hint ? <span className="ml-1.5 text-[12px] text-muted font-normal">{hint}</span> : null}
    </span>
  );
}

export function Field({
  label, hint, className, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <input {...rest} className={clsx(CONTROL, "h-9", className)} />
    </label>
  );
}

export function TextareaField({
  label, hint, className, ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <textarea {...rest} className={clsx(CONTROL, "py-2.5 leading-relaxed", className)} />
    </label>
  );
}

export function SelectField({
  label, hint, className, children, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <select {...rest} className={clsx(CONTROL, "h-9", className)}>{children}</select>
    </label>
  );
}

export function Checkbox({
  label, className, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
      <input type="checkbox" {...rest} className={clsx("w-4 h-4 accent-ink", className)} />
      {label}
    </label>
  );
}

/** Two-column form grid that collapses on small screens. */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

/** Inline notice — success/warning/danger/info, used for action feedback. */
export function Notice({
  tone = "info", children,
}: { tone?: Tone; children: React.ReactNode }) {
  return (
    <div className={clsx(
      "mb-5 rounded-card border px-4 py-3 text-sm", TONES[tone],
    )}>
      {children}
    </div>
  );
}
