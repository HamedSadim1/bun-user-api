import path from "node:path";
import cors from "cors";
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
        "script-src": ["'self'", "'sha256-r07KTs5HX38Yzm1Krb78R0dY1BBLwr49Yuor2vkybS0='"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
  }),
);

// CORS voor cross-origin requests
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  }),
);

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Statische bestanden
app.use(express.static(path.resolve("public")));

// Routes
app.use(userRoutes);

// Verbind met MongoDB en start de server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server draait op poort ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error({ error }, "Kon niet verbinden met MongoDB");
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  logger.info("Server wordt afgesloten...");
  await closeDB();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
