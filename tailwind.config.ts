import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        unipaz: {
          navy: {
            deep: "#001833",
            DEFAULT: "#002855",
            surface: "#112240",
            dark: "#0A1526",
            light: "#1A365D",
          },
          cobalt: {
            DEFAULT: "#0056B3",
            light: "#0070F3",
            hover: "#004494",
          },
          orange: {
            DEFAULT: "#FF5500",
            hover: "#E04B00",
            soft: "#FFF0EB",
            glow: "rgba(255, 85, 0, 0.35)",
          },
          gold: {
            DEFAULT: "#FFAA00",
            light: "#FFC72C",
            soft: "#FFF8E7",
            glow: "rgba(255, 170, 0, 0.4)",
          },
        },
      },
      boxShadow: {
        "unipaz-card": "0 8px 30px rgb(0, 40, 85, 0.12)",
        "unipaz-glow-orange": "0 0 25px rgba(255, 85, 0, 0.35)",
        "unipaz-glow-cobalt": "0 0 25px rgba(0, 86, 179, 0.4)",
        "unipaz-glow-gold": "0 0 25px rgba(255, 170, 0, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
      },
    },
  },
  plugins: [],
};

export default config;
