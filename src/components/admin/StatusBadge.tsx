import { Badge, type Tone } from "./ui";

/**
 * Order and sourcing-request statuses, mapped onto the warm semantic scale.
 * Previously these used Tailwind's stock green-100/blue-100/purple-100 tints,
 * which read as cold and pasted-on against the paper/cream neutrals.
 *
 * `accent` is reserved for NEW — the one status that is a call to action.
 */
const TONE: Record<string, Tone> = {
  // Order status
  PENDING:   "neutral",
  PAID:      "success",
  SHIPPED:   "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  FAILED:    "danger",
  REFUNDED:  "warning",
  APPROVED:  "success",

  // Sourcing request status
  NEW:         "accent",
  IN_PROGRESS: "info",
  QUOTED:      "warning",
  SOURCED:     "success",
  CLOSED:      "neutral",
};

/** Sentence case reads better than SHOUTED CAPS in a dense table. */
function label(value: string) {
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={TONE[value] ?? "neutral"}>{label(value)}</Badge>;
}
