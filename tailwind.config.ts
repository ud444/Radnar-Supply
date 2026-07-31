import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      // Driven by CSS variables (declared in globals.css) so the admin can flip
      // to its dark "night atelier" canvas by scoping one class, without the
      // storefront changing at all. The :root values are byte-identical to the
      // previous literals, so light rendering is unaffected.
      //
      // In the dark scope the names keep their ROLE, not their literal hue:
      //   ink   = foreground        paper = canvas
      //   bone  = panel surface     cream = raised surface
      //   line  = hairline          muted = secondary text
      colors: {
        ink:    "rgb(var(--c-ink) / <alpha-value>)",
        paper:  "rgb(var(--c-paper) / <alpha-value>)",
        cream:  "rgb(var(--c-cream) / <alpha-value>)",
        bone:   "rgb(var(--c-bone) / <alpha-value>)",
        muted:  "rgb(var(--c-muted) / <alpha-value>)",
        line:   "rgb(var(--c-line) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",

        // Semantic status scale. Warm and desaturated on light; brightened for
        // the dark canvas so it reads without glaring. `accent` stays reserved
        // for interaction (focus, active nav, live alerts), never for "good",
        // so brand and status never compete.
        success: {
          DEFAULT: "rgb(var(--c-success) / <alpha-value>)",
          tint:    "rgb(var(--c-success-tint) / <alpha-value>)",
          line:    "rgb(var(--c-success-line) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--c-info) / <alpha-value>)",
          tint:    "rgb(var(--c-info-tint) / <alpha-value>)",
          line:    "rgb(var(--c-info-line) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--c-warning) / <alpha-value>)",
          tint:    "rgb(var(--c-warning-tint) / <alpha-value>)",
          line:    "rgb(var(--c-warning-line) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
          tint:    "rgb(var(--c-danger-tint) / <alpha-value>)",
          line:    "rgb(var(--c-danger-line) / <alpha-value>)",
        },
      },
      borderRadius: {
        // One scale for the admin: controls, cards, pills.
        control: "8px",
        card:    "12px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "ui-sans-serif", "sans-serif"],
        sans:    ["var(--font-sans)",    "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2:  "0.22em",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
