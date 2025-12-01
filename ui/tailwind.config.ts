import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0a0a0f",
          secondary: "#12121a",
          tertiary: "#1a1a24",
        },
        foreground: {
          DEFAULT: "#f5f5f5",
          muted: "#a1a1aa",
        },
        border: {
          DEFAULT: "#27272a",
          hover: "#3f3f46",
        },
        accent: {
          DEFAULT: "#f97316",
          hover: "#fb923c",
          muted: "#f9731620",
        },
        muted: {
          DEFAULT: "#71717a",
          foreground: "#a1a1aa",
        },
        success: {
          DEFAULT: "#22c55e",
          muted: "#22c55e20",
        },
        card: {
          DEFAULT: "#141419",
          hover: "#1a1a22",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-dark": "linear-gradient(to bottom right, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
