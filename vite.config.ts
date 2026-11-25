import path from "node:path";
import { defineConfig } from "vite";

const API = "http://localhost:5050";

export default defineConfig({
  // Geen public/-map: HTML, CSS en scripts zitten in de module-graph
  publicDir: false,
  plugins: [
    {
      // In productie doet Express dit; in dev moet /users naar users.html wijzen
      name: "users-route",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === "/users") req.url = "/users.html";
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      "/addUser": API,
      "/getUsers": API,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        signup: path.resolve("index.html"),
        users: path.resolve("users.html"),
      },
    },
  },
});
