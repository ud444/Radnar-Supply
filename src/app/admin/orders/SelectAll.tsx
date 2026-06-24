"use client";

/** Header checkbox that toggles every order checkbox in the bulk form. */
export function SelectAll() {
  return (
    <input
      type="checkbox"
      aria-label="Select all"
      className="w-4 h-4"
      onChange={(e) => {
        const form = e.currentTarget.closest("form");
        form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((c) => {
          c.checked = e.currentTarget.checked;
        });
      }}
    />
  );
}
