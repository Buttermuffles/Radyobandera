/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Override default screens with intermediate breakpoints for mobile-first design
    screens: {
      xs: "320px",  // Ultra-small phones (iPhone SE, etc)
      sm: "480px",  // Larger phones (iPhone 12, Pixel 4, etc)
      md: "768px",  // Small tablets (iPad mini)
      lg: "1024px", // Tablets (iPad, iPad Pro 11")
      xl: "1280px", // Laptops
      "2xl": "1536px", // Large desktops
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
        // Responsive text scales for mobile-first design
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
        // Mobile-optimized spacing (reduced padding/margin on xs screens)
        safe: "env(safe-area-inset-bottom)", // For notch-aware positioning
      },
      minWidth: {
        touch: "44px", // Minimum touch target width (WCAG 2.5.5)
      },
      minHeight: {
        touch: "44px", // Minimum touch target height (WCAG 2.5.5)
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
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.15)",
        strong: "0 10px 25px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
}

