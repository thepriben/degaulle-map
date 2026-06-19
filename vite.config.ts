import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `base` correspond au nom du dépôt pour un déploiement GitHub Pages
// sur https://thepriben.github.io/degaulle-map/.
export default defineConfig({
  base: "/degaulle-map/",
  plugins: [react(), tailwindcss()],
});
