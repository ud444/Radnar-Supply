import { requireUser } from "@/lib/auth";
import { SecurityForm } from "./SecurityForm";

export default async function Security() {
  const user = await requireUser();
  return (
    <div>
      <div className="eyebrow-lead">Account · Security</div>
      <h1 className="mt-2 font-display font-black text-4xl md:text-6xl uppercase display-tight">Security.</h1>
      <p className="mt-3 text-sm text-ink/70 max-w-md">
        Change your password. Signed in as <span className="font-medium text-ink">{user.email}</span>. Updating signs you out of other devices.
      </p>

      <div className="mt-10 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <SecurityForm />
        </div>
        <aside className="md:col-span-5">
          <div className="card-frame">
            <div className="eyebrow-lead">Tips</div>
            <ul className="mt-4 space-y-3 text-[13px] text-ink/80 leading-relaxed">
              <li className="flex gap-3"><span className="num-mark">·</span><span>Use a passphrase — long &amp; uncommon beats short &amp; complex.</span></li>
              <li className="flex gap-3"><span className="num-mark">·</span><span>Never reuse passwords between sites.</span></li>
              <li className="flex gap-3"><span className="num-mark">·</span><span>A password manager (1Password, Bitwarden, iCloud) makes this easy.</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
