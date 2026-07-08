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
    origin: "*",
    methods: ["GET", "POST"],
  }),
);

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.resolve("public")));

// Routes
app.get("/users", (_req, res) => {
  res.sendFile(path.resolve("public/users.html"));
});
app.use(userRoutes);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err }, "Onverwachte fout");
  res.status(500).send({ error: "Interne serverfout" });
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

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server draait op poort ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error({ error }, "Kon niet verbinden met MongoDB");
    process.exit(1);
  });
