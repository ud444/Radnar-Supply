import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FAFAFA",
        muted: "#6B7280",
        line: "#E5E7EB",
        soft: "#F4F4F5",
        accent: "#FF4D00",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
} satisfies Config;
