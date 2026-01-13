/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta para tienda de ropa (Minimalista/Urbana)
        primary: {
          DEFAULT: "#000000", // Negro principal
          hover: "#1a1a1a",
          inverse: "#ffffff"
        },
        secondary: "#666666",
        text: {
          primary: "#000000",   // Esto habilita 'text-text-primary'
          secondary: "#4b5563", // Esto habilita 'text-text-secondary'
          muted: "#9ca3af",
          inverse: "#ffffff"
        },
        ui: {
          border: "#e5e7eb",    // Esto habilita 'border-ui-border'
        },
        surface: "#f9fafb",
        background: "#ffffff",
      },
      // Tipografía más limpia para moda
      letterSpacing: {
        tighter: '-0.05em',
        widest: '0.25em',
      }
    },
  },
  plugins: [],
}