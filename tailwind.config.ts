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
          DEFAULT: '#2F6EF6', // The Blue you found
          light: 'rgba(47, 110, 246, 0.1)', // The 10% opacity accent
        },
        dark: {
          DEFAULT: '#290619', // The dark background color
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)'], // This connects to the font setup we did earlier
      }
    },
  },
  plugins: [],
};
export default config;