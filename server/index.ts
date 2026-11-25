import path from "node:path";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import { closeDB, connectDB } from "./lib/database";
import { logger } from "./lib/logger";
import userRoutes from "./routes/users";

const app = express();
const PORT = 5050;
// Uitvoer van `bun run build` (Vite)
const DIST_DIR = path.resolve("dist");

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
  }),
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  }),
);

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Standaard is dit een pure JSON-API. De frontend draait via Vite (dev) of wordt
// als statische build gehost; Express serveert dist/ alleen op verzoek.
const SERVES_FRONTEND = process.env.SERVE_FRONTEND === "1";

if (SERVES_FRONTEND) {
  // Eén canonieke URL: /users.html staat wel in dist/, maar verwijst permanent door
  app.get("/users.html", (_req, res) => {
    res.redirect(301, "/users");
  });

  // Static bestanden uit de Vite-build
  app.use(express.static(DIST_DIR));

  app.get("/users", (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "users.html"));
  });
}

// API-index: één blik op wat deze server doet
app.get("/", (_req, res) => {
  res.json({
    name: "bun-user-api",
    status: "ok",
    endpoints: {
      "GET /getUsers": "Gebruikers (max 100) plus het totaal",
      "POST /addUser": "Nieuwe gebruiker toevoegen (JSON of form-encoded)",
    },
  });
});

// API-routes
app.use(userRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).send({ error: "Route not found" });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err }, "Onverwachte fout");
  res.status(500).send({ error: "Internal server error" });
});

// Graceful shutdown
let server: ReturnType<typeof app.listen> | null = null;

const shutdown = async () => {
  logger.info("Server wordt afgesloten...");
  if (server) {
    server.closeAllConnections?.();
    server.close();
  }
  await closeDB();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const start = async () => {
  // Alleen nodig als Express de frontend moet serveren
  if (SERVES_FRONTEND && !(await Bun.file(path.join(DIST_DIR, "index.html")).exists())) {
    logger.error("dist/ ontbreekt — draai eerst `bun run build`");
    process.exit(1);
  }
  await connectDB();
  server = app.listen(PORT);
  // Wacht op de bind; Bun meldt een bezette poort soms pas na 'listening'
  await new Promise<void>((resolve, reject) => {
    server?.once("error", reject);
    server?.once("listening", () => setTimeout(resolve, 25));
  });
  logger.info(`Server draait op poort ${PORT}`);
  // Fouten ná een geslaagde start horen niet stil te blijven
  server.on("error", (error: Error) => {
    logger.error(`Serverfout: ${error.message}`);
  });
};

// Kort en leesbaar: de driver-dump bij een mislukte verbinding is onbruikbaar
start().catch((error: unknown) => {
  if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
    logger.error(`Poort ${PORT} is al in gebruik — stop de andere server of container`);
  } else {
    const reason = error instanceof Error ? error.message : String(error);
    logger.error(`Kon de server niet starten: ${reason}`);
    if (process.env.NODE_ENV !== "production") {
      logger.error("Draait MongoDB? Start hem met: docker compose -f mongodb.yaml up -d mongo");
    }
  }
  process.exit(1);
});
