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
    minify: "terser", // Minificar código JavaScript
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Optimizar nombres de chunks
        manualChunks: undefined,
        // Minificar nombres de archivos
        assetFileNames: "assets/[name].[hash:8][extname]",
        chunkFileNames: "assets/[name].[hash:8].js",
        entryFileNames: "assets/[name].[hash:8].js",
      },
    },
    // Reducir tamaño de source maps (o deshabilitarlos en producción)
    sourcemap: false,
    // Reportar tamaños de chunks
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  // Configuración del servidor de desarrollo para Capacitor
  server: {
    host: "0.0.0.0", // Permitir acceso desde la red local (necesario para probar en dispositivos)
    port: 5173,
  },
});
