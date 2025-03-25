import { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "verde-oscuro": "#1d5126",
        "verde-claro": "#3e7c27",
        "verde-mas-claro": "#4e722d",
        blanco: "#ffffff",
      },
      perspective: {
        "1000": "1000px",
      },
      transformStyle: {
        preserve: "preserve-3d",
      },
      backfaceVisibility: {
        hidden: "hidden",
      },
    },
  },
  plugins: [],
} satisfies Config;
