import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#25D366", // verde WhatsApp
          600: "#1fb855",
          700: "#189042",
        },
      },
    },
  },
  plugins: [],
};

export default config;
