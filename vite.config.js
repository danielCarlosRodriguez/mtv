import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Plugin estándar de React
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
