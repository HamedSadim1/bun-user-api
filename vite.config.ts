import path from "node:path";
import { defineConfig } from "vite";
import { API_ORIGIN, API_ROUTES, CANONICAL_REDIRECTS, PAGES, WEB_PORT } from "./shared/config.ts";

const CLIENT_DIR = path.resolve("client");

// Pagina-URL's die Vite in dev als HTML-bestand moet serveren; "/" doet Vite zelf
const PAGE_FILES: Record<string, string> = Object.fromEntries(
  Object.values(PAGES)
    .filter((page) => page.route !== "/")
    .map((page) => [page.route, `/${page.file}`]),
);

export default defineConfig({
  // Alle frontend-bronnen staan in client/; de build gaat naar dist/ in de root
  root: CLIENT_DIR,
  publicDir: false,
  plugins: [
    {
      // In productie regelt Express dit; in dev bootst Vite dezelfde regels na
      name: "page-routes",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? "";
          const redirect = CANONICAL_REDIRECTS[url];
          if (redirect) {
            res.writeHead(301, { Location: redirect });
            res.end();
            return;
          }
          const file = PAGE_FILES[url];
          if (file) req.url = file;
          next();
        });
      },
    },
  ],
  server: {
    port: WEB_PORT,
    proxy: Object.fromEntries(Object.values(API_ROUTES).map((route) => [route, API_ORIGIN])),
  },
  build: {
    outDir: path.resolve("dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(PAGES).map(([name, page]) => [name, path.join(CLIENT_DIR, page.file)]),
      ),
    },
  },
});
