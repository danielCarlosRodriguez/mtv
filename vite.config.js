import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Plugin estándar de React
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { unlinkSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

// Plugin para excluir archivos .apk del build
const excludeApkPlugin = () => {
  return {
    name: "exclude-apk",
    writeBundle() {
      // Eliminar archivos .apk después del build
      const distDir = resolve(__dirname, "dist");
      if (existsSync(distDir)) {
        const deleteApkFiles = (dir) => {
          const files = readdirSync(dir);
          files.forEach((file) => {
            const filePath = join(dir, file);
            const stat = statSync(filePath);
            if (stat.isDirectory()) {
              deleteApkFiles(filePath);
            } else if (file.endsWith(".apk")) {
              try {
                unlinkSync(filePath);
                console.log(`✅ Eliminado APK del build: ${filePath}`);
              } catch (error) {
                console.warn(`⚠️  No se pudo eliminar: ${filePath}`, error.message);
              }
            }
          });
        };
        deleteApkFiles(distDir);
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), excludeApkPlugin()],
  // Configuración para Capacitor
  base: "./", // Importante: usa rutas relativas para Capacitor
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: "esbuild", // Minificar código JavaScript (esbuild es más rápido y viene incluido)
    esbuild: {
      drop: ["console", "debugger"], // Eliminar console.log y debugger en producción
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
    // Excluir el APK del build (no debe copiarse al dist)
    copyPublicDir: true,
    publicDir: "public",
    // Configuración para excluir archivos específicos
    emptyOutDir: true,
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
