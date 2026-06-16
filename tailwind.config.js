/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#CC0000",
          blue: "#003087",
          yellow: "#FFD700",
          dark: "#1A1A1A",
          gray: "#F4F4F4",
          muted: "#666666",
        },
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Source Serif 4", "serif"],
        ui: ["Inter", "sans-serif"],
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        ticker: "ticker 35s linear infinite",
      },
    },
  },
  plugins: [],
}

