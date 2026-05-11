import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#FFFFFF",
          card: "#FFFFFF",
          soft: "#F7F7F7",
          primary: "#7C5CFF",
          secondary: "#00D1B2",
          accent: "#FACC15",
          danger: "#FF4D6D",
          text: "#000000",
          muted: "#52525B",
          border: "#000000",
        },
      },
      boxShadow: {
        vault: "6px 6px 0 #000",
        "vault-hover": "10px 10px 0 #000",
        gold: "10px 10px 0 #FACC15",
      },
      borderRadius: {
        vault: "12px",
      },
      keyframes: {
        "counter-rise": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "counter-rise": "counter-rise 450ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
