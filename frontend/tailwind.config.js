/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Animaciones
      animation: {
        marquee: 'marquee 25s linear infinite',
        'spin-slow': 'spin 30s linear infinite', // Útil para efectos orbitales lentos
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },

      // 2. Colores (Paleta "Night Ride")
      colors: {
        brand: {
          carbon: '#0A0A0B',    // Negro ultra profundo (Hero)
          titanium: '#E2E8F0',  // Texto principal
          accent: '#FF4D00',    // Naranja Racing (Color Principal)
          'accent-dark': '#CC3D00', // Hover del naranja
        },
        surface: {
          // Definiciones crudas
          900: '#121214',
          800: '#1A1A1E',
          100: '#F8FAFC',
          
          // Definiciones Semánticas (Las que usamos en el código)
          base: '#0f1115',      // Fondo general de la página
          card: '#16191e',      // Fondo de tarjetas/modales
          hover: '#1c1f24',     // Color al pasar el mouse
        },
        
        // Alias de Compatibilidad (Para que no se rompan componentes viejos)
        primary: '#FF4D00',         
        'ui-border': 'rgba(255, 255, 255, 0.1)', // Bordes sutiles
        'text-primary': '#E2E8F0',  
        'text-secondary': '#94A3B8', 
        'text-muted': '#64748B',
      },

      // 3. Sombras y Efectos
      boxShadow: {
        'product': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(255, 77, 0, 0.3)', // Resplandor naranja neón
      },
      
      // 4. Fondos
      backgroundImage: {
        'carbon-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17l9-9-1.41-1.41L10 14.17l-7.59-7.58L1 8l9 9z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}