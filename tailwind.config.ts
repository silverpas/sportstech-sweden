import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        navy: {
          DEFAULT: "#1A1A2E",
          900: "#14142b",
          800: "#1A1A2E",
          700: "#2a2a45",
        },
        gold: {
          DEFAULT: "#F5C500",
          dark: "#B8930A",
        },
        // Light UI surfaces + ink
        page: "#F4F6F9",
        surface: "#FFFFFF",
        line: "#E4E7EC",
        ink: {
          DEFAULT: "#151A24",
          soft: "#556072",
          muted: "#8A93A3",
        },
        // Sector categorical palette (validated for CVD on a light surface)
        sector: {
          athletes: "#1F8A54",
          executives: "#2C5FCC",
          fans: "#B5179E",
          other: "#7A8394",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
        "card-hover": "0 4px 12px rgba(16,24,40,0.08), 0 12px 32px rgba(16,24,40,0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
