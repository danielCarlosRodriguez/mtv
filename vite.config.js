import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Plugin estándar de React
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Configuración para Capacitor
  base: "./", // Importante: usa rutas relativas para Capacitor
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Asegurar que los assets se carguen correctamente en la app móvil
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  // Configuración del servidor de desarrollo para Capacitor
  server: {
    host: "0.0.0.0", // Permitir acceso desde la red local (necesario para probar en dispositivos)
    port: 5173,
  },
});
