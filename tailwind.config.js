/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

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

      fontSize: {
        xs: ["11px", "14px"],
        sm: ["13px", "16px"],
        base: ["14px", "20px"],
        lg: ["16px", "24px"],
        xl: ["18px", "28px"],
        "2xl": ["20px", "28px"],
        "3xl": ["24px", "32px"],
        "4xl": ["28px", "36px"],
      },

      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },

      minWidth: {
        touch: "44px",
      },

      minHeight: {
        touch: "44px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.15)",
        strong: "0 10px 25px rgba(0, 0, 0, 0.2)",
      },
    },
  },

  plugins: [],
};