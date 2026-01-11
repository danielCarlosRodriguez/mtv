import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Plugin estándar de React
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { existsSync, copyFileSync, unlinkSync } from "fs";

// Plugin para manejar el APK: excluirlo del copyPublicDir pero copiarlo después en Netlify
const apkPlugin = () => {
  return {
    name: "apk-handler",
    buildStart() {
      // Antes del build, nada que hacer
    },
    writeBundle() {
      // Verificar si es un build de Netlify
      const isNetlify = process.env.NETLIFY === "true" || process.env.CI === "true";
      
      const apkPublic = resolve(__dirname, "public", "mtv2026.apk");
      const apkDist = resolve(__dirname, "dist", "mtv2026.apk");
      
      if (isNetlify && existsSync(apkPublic)) {
        // En Netlify: copiar el APK después del build para que esté disponible
        try {
          copyFileSync(apkPublic, apkDist);
          console.log("✅ APK copiado a dist/ para Netlify");
        } catch (error) {
          console.warn("⚠️  No se pudo copiar el APK:", error.message);
        }
      } else if (!isNetlify && existsSync(apkDist)) {
        // En builds locales: eliminar el APK si existe en dist/
        try {
          unlinkSync(apkDist);
          console.log("✅ APK eliminado de dist/ (build local)");
        } catch (error) {
          console.warn("⚠️  No se pudo eliminar el APK:", error.message);
        }
      }
    },
  };
};

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // Usar el nuevo runtime JSX de React 19
      jsxImportSource: 'react', // Especificar el import source para React 19
    }),
    tailwindcss(),
    apkPlugin()
  ],
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
    // Copiar archivos públicos (el plugin apkPlugin eliminará el APK después si no es Netlify)
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
