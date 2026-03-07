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
        primary: {
          DEFAULT: '#2F6EF6', 
          light: 'rgba(47, 110, 246, 0.1)', 
        },
        dark: {
          DEFAULT: '#290619', 
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)'], 
        // ADDED FRAUNCES HERE
        fraunces: ['var(--font-fraunces)', 'serif'], 
      }
    },
  },
  plugins: [],
};
export default config;