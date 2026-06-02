import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "tilt-purple": "var(--color-tilt-purple)",
        "high-score-orange": "var(--color-high-score-orange)",
        crema: "var(--color-crema)",
        "after-dark": "var(--color-after-dark)",
        "last-train-purple": "var(--color-last-train-purple)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        hairline: "var(--color-hairline)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "monospace"],
      },
      maxWidth: {
        prose: "65ch",
        layout: "1280px",
      },
    },
  },
  plugins: [],
} satisfies Config;
