import { SCOPES } from "@/lib/apiKey";
import { createKey } from "./actions";
import { Button, Field, Label } from "@/components/admin/ui";

export function NewKeyForm() {
  return (
    <form action={createKey} className="space-y-5">
      <Field label="Key name" name="name" required placeholder="e.g. SyncLayer production" />

      <div>
        <Label>Scopes</Label>
        <div className="grid sm:grid-cols-3 gap-2">
          {SCOPES.map((s) => (
            <label
              key={s.id}
              className="flex items-start gap-2.5 rounded-control border border-ink/15 p-3 cursor-pointer text-sm transition-colors hover:border-ink/40 hover:bg-cream/60 has-[:checked]:border-ink has-[:checked]:bg-cream"
            >
              <input type="checkbox" name="scopes" value={s.id} className="mt-0.5 w-4 h-4 accent-ink" />
              <span className="min-w-0">
                <span className="font-medium block">{s.label}</span>
                <span className="text-[12px] text-muted mt-0.5 block">{s.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button>Create key →</Button>
    </form>
  );
}
