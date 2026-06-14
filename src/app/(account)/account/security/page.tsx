import { requireUser } from "@/lib/auth";
import { SecurityForm } from "./SecurityForm";

export default async function Security() {
  const user = await requireUser();
  return (
    <div>
      <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55">Account</div>
      <h1 className="mt-1 font-display font-black text-3xl md:text-4xl uppercase display-tight">Security</h1>
      <p className="mt-3 text-sm text-ink/70">Change your password. Signed in as <span className="font-medium">{user.email}</span>.</p>

      <SecurityForm />
    </div>
  );
}
