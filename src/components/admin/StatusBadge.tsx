export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    PAID:      "bg-green-100 text-green-800 border-green-300",
    SHIPPED:   "bg-blue-100 text-blue-800 border-blue-300",
    DELIVERED: "bg-purple-100 text-purple-800 border-purple-300",
    PENDING:   "bg-cream text-ink/65 border-ink/20",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
    FAILED:    "bg-red-100 text-red-800 border-red-300",
    REFUNDED:  "bg-orange-100 text-orange-800 border-orange-300",
    APPROVED:  "bg-green-100 text-green-800 border-green-300",
    // Sourcing request statuses
    NEW:         "bg-accent/15 text-accent border-accent/40",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
    QUOTED:      "bg-amber-100 text-amber-800 border-amber-300",
    SOURCED:     "bg-green-100 text-green-800 border-green-300",
    CLOSED:      "bg-cream text-ink/65 border-ink/20",
  };
  const label = value.replace(/_/g, " ").toLowerCase();
  return <span className={`text-[10px] px-2 py-1 border tracking-[0.14em] uppercase font-bold ${map[value] ?? "bg-cream text-ink/65 border-ink/20"}`}>{label}</span>;
}
