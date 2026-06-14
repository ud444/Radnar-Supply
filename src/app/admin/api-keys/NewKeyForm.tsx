import { SCOPES } from "@/lib/apiKey";
import { createKey } from "./actions";

export function NewKeyForm() {
  return (
    <form action={createKey} className="space-y-4">
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Create New Key</div>
      <div className="field">
        <label className="field-label">Name</label>
        <input name="name" required placeholder="e.g. Synclayer Production" className="field-input" />
      </div>

      <div>
        <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-2">Scopes (pick what this key can do)</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {SCOPES.map((s) => (
            <label key={s.id} className="flex items-start gap-2 border border-ink/15 px-3 py-2.5 hover:border-ink cursor-pointer text-sm">
              <input type="checkbox" name="scopes" value={s.id} className="mt-1" />
              <span>
                <span className="font-medium block">{s.label}</span>
                <span className="text-[11px] text-ink/55 font-mono">{s.id}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn">Generate Key →</button>
      <p className="text-[11px] text-ink/55">The full key is shown once after creation. After that, only the prefix appears in the list.</p>
    </form>
  );
}
