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
        beige: {
          light: "#F5F5DC",
          DEFAULT: "#F5E6D3",
        },
      },
      fontFamily: {
        cursive: ['"Dancing Script"', "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;

