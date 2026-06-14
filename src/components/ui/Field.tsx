type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Field({ label, hint, error, id, name, className = "", ...rest }: Props) {
  const fieldId = id ?? name ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="field">
      <label htmlFor={fieldId} className="field-label">{label}</label>
      <input id={fieldId} name={name} {...rest} className={`field-input ${className}`} />
      {error ? <div className="field-error">{error}</div> : hint ? <div className="text-[11px] text-ink/50 mt-1">{hint}</div> : null}
    </div>
  );
}
