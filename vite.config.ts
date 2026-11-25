import path from "node:path";
import { defineConfig } from "vite";

const API = "http://localhost:5050";
const CLIENT_DIR = path.resolve("client");

export default defineConfig({
  // Alle frontend-bronnen staan in client/; de build gaat naar dist/ in de root
  root: CLIENT_DIR,
  publicDir: false,
  plugins: [
    {
      // In productie doet Express dit; in dev moet /users naar users.html wijzen
      name: "users-route",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // /users.html is een intern bestand; naar buiten toe is /users canoniek
          if (req.url === "/users.html") {
            res.writeHead(301, { Location: "/users" });
            res.end();
            return;
          }
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
    outDir: path.resolve("dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        signup: path.join(CLIENT_DIR, "index.html"),
        users: path.join(CLIENT_DIR, "users.html"),
      },
    },
  },
});
