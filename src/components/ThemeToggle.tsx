"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export const THEME_KEY = "rs-theme";

type Theme = "light" | "dark";

/**
 * Light/dark switch for both the storefront and the admin.
 *
 * The document theme lives on <html data-theme>, applied before paint by the
 * inline script in the root layout so there is no flash of the wrong palette.
 * This component only reflects and updates it.
 *
 * An explicit choice is stored and wins everywhere. With no stored choice the
 * default differs by surface — the storefront reads light, the admin dark —
 * which is why the resolution logic lives in that script rather than here.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function apply(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
    setTheme(next);
  }

  // Render nothing until mounted: the server cannot know the stored choice, and
  // guessing produces a hydration mismatch and a visible flicker.
  if (theme === null) {
    return <span className={clsx("inline-block w-9 h-9", className)} aria-hidden />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={clsx(
        "inline-flex items-center justify-center w-9 h-9 rounded-full",
        "text-current transition-colors hover:bg-ink/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
    >
      {theme === "dark" ? (
        // Currently dark → offer the sun
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
        </svg>
      ) : (
        // Currently light → offer the moon
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z" />
        </svg>
      )}
    </button>
  );
}
