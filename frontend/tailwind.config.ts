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
        // Paleta "Editorial Boutique" (Fondo Blanco / Tarjetas Beige)
        legal: {
          bg: "#ffffff",       // FONDO: Blanco puro (limpieza total)
          surface: "#f9f7f4",  // TARJETAS: Beige Crema muy suave ("Warm Paper")
          border: "#e6e1db",   // BORDES: Arena suave (para separar sutilmente)
          text: "#2b2926",     // TEXTO: Negro cálido (no negro puro, más elegante)
          muted: "#78716c",    // TEXTO SECUNDARIO: Gris piedra
        },
        primary: {
          DEFAULT: "#a68a64", // Dorado/Bronce desaturado (muy sofisticado)
          hover: "#8c7352",   // Hover un poco más oscuro
          light: "#f0ebe5",   // Fondo para etiquetas o elementos muy claros
        },
        risk: {
          high: "#d93025",    // Rojo editorial
          safe: "#188038",    // Verde editorial
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
      }
    },
  },
  plugins: [],
};
export default config;