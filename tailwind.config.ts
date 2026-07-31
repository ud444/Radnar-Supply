import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink:    "#0A0A0A",
        paper:  "#F4F1EA",
        cream:  "#EFEAE0",
        bone:   "#FFFEFB",
        muted:  "#5C5853",
        line:   "#D9D1C2",
        accent: "#FF4D00",

        // Semantic status scale for the admin. Deliberately warm and
        // desaturated so it sits on the paper/cream neutrals — Tailwind's stock
        // green-100/blue-100 tints read as cold and pasted-on against them.
        // `accent` stays reserved for interaction (focus, active nav, alerts),
        // never for "good", so the two never compete.
        success: { DEFAULT: "#2F6B4F", tint: "#E7F0E9", line: "#C1D7C7" },
        info:    { DEFAULT: "#35566F", tint: "#E8EEF3", line: "#C4D3DE" },
        warning: { DEFAULT: "#8A5A12", tint: "#F7EEDC", line: "#E4D0A8" },
        danger:  { DEFAULT: "#8E2F2A", tint: "#F7E7E4", line: "#E6C3BD" },
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
