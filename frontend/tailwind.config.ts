import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Cavaliers team colors (wine and gold)
        wine: {
          500: '#9E1C3C',
          600: '#860038',
          700: '#6F0029',
        },
        gold: {
          400: '#FFD700',
          500: '#FDBB30',
          600: '#E4A600',
        },
      },
    },
  },
  plugins: [],
};
export default config;
