import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Disable automatic dark mode detection
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#171717",
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
