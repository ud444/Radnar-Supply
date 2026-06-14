import { SCOPES } from "@/lib/apiKey";
import { createKey } from "./actions";

export function NewKeyForm() {
  return (
    <form action={createKey} className="space-y-5">
      <div className="field">
        <label className="field-label">Key name</label>
        <input name="name" required placeholder="e.g. SyncLayer Production" className="field-input" />
      </div>

      <div>
        <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-2">Select scopes</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {SCOPES.map((s) => (
            <label key={s.id} className="flex items-start gap-2 border-2 border-ink/15 hover:border-ink p-3 cursor-pointer text-sm">
              <input type="checkbox" name="scopes" value={s.id} className="mt-1" />
              <span>
                <span className="font-display font-bold uppercase tracking-tight block">{s.label}</span>
                <span className="text-[11px] text-ink/55 mt-0.5 block">{s.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn">Create →</button>
    </form>
  );
}
