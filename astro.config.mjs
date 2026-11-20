import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const EXCLUDED_FROM_SITEMAP = new Set([
  "/buscar/",
  "/aviso-legal/",
  "/privacidad/",
  "/cookies/",
  "/accesibilidad/",
]);

export default defineConfig({
  site: "https://www.hoyextremaduraesfuturo.es",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      filter: (page) =>
        !EXCLUDED_FROM_SITEMAP.has(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
