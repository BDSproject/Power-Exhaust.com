import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bmw-blue": "#1C69D4",
        "bmw-blue-dark": "#0C4E9E",
        "bmw-blue-light": "#4A8FE0",
        "bmw-light": "#9FC9EF",
        "bmw-pale": "#E8F1FB",
        "bmw-dark": "#0C2340",
      },
      boxShadow: {
        bmw: "0 4px 14px rgba(28, 105, 212, 0.35)",
        "bmw-lg": "0 8px 25px rgba(28, 105, 212, 0.45)",
      },
      backgroundImage: {
        "bmw-gradient":
          "linear-gradient(135deg, #0C2340 0%, #1C69D4 60%, #0C4E9E 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-in": "slideIn 0.35s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
