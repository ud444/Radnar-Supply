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
