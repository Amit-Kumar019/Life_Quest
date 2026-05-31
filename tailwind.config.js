/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "var(--theme-bg)",
          card: "var(--theme-card)",
          border: "var(--theme-border)",
          text: "var(--theme-text)",
          muted: "var(--theme-muted)",
          primary: "var(--theme-primary)",
          secondary: "var(--theme-secondary)",
          accent: "var(--theme-accent)",
          gold: "var(--theme-gold)",
          success: "var(--theme-success)",
        }
      },
      boxShadow: {
        themeGlow: "0 0 15px var(--theme-glow)",
      },
      fontFamily: {
        game: ["system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
}
