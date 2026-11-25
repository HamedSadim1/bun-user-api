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

// Static files uit de Vite-build
app.use(express.static(DIST_DIR));

// Routes
app.get("/users", (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "users.html"));
});
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
  if (!(await Bun.file(path.join(DIST_DIR, "index.html")).exists())) {
    logger.error("dist/ ontbreekt — draai eerst `bun run build`");
    process.exit(1);
  }
  await connectDB();
  server = app.listen(PORT, () => {
    logger.info(`Server draait op poort ${PORT}`);
  });
};

start().catch((error) => {
  logger.error({ error }, "Kon de server niet starten");
  process.exit(1);
});
