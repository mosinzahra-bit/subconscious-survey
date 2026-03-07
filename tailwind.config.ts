import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        husbar: {
          bgPrimary: "var(--bg-primary)",
          bgSecondary: "var(--bg-secondary)",
          bgElevated: "var(--bg-elevated)",
          border: "var(--border)",
          borderBright: "var(--border-bright)",
          greenVivid: "var(--green-vivid)",
          greenMid: "var(--green-mid)",
          greenDeep: "var(--green-deep)",
          greenSoft: "var(--green-soft)",
          greenMuted: "var(--green-muted)",
          greenPale: "var(--green-pale)",
          gold: "var(--gold)",
          redAlert: "var(--red-alert)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          textMuted: "var(--text-muted)",
          textDim: "var(--text-dim)"
        }
      },
      fontFamily: {
        heading: ["Sora", "system-ui", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        data: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
        callout: ["Playfair Display", "serif"]
      },
      borderRadius: {
        lg: "0.6rem",
        md: "0.4rem",
        sm: "0.25rem"
      }
    }
  },
  plugins: []
};

export default config;

