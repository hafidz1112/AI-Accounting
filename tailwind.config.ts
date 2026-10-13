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
        sage: {
          50: "#F2F8F5",
          100: "#E2F2EB",
          200: "#C4E4D7",
          300: "#9ECFB9",
          400: "#6FB396",
          500: "#49967A",
          600: "#367C69", // Signature deep sage green
          700: "#2D6858",
          800: "#235346",
          900: "#1A3D34",
          950: "#0F2620",
        },
        gold: {
          50: "#FEF9EE",
          100: "#FDF2D7",
          200: "#FBE4AD",
          300: "#F8D47E",
          400: "#F5BE47", // Signature golden yellow
          500: "#E8A72F",
          600: "#C9851F",
          700: "#9D6118",
        },
        mint: {
          50: "#F6FAF8",
          100: "#EDF7F2",
          200: "#DCF0E7",
          300: "#C3E6D7",
          400: "#9CD3BF",
        },
        brand: {
          50: "#F2F8F5",
          100: "#E2F2EB",
          500: "#367C69",
          600: "#2D6858",
          700: "#235346",
        },
      },
    },
  },
  plugins: [],
};

export default config;
