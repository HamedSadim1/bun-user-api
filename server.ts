import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { logger } from "./lib/logger";
import userRoutes from "./routes/users";

const app = express();
const PORT = 5050;

// Security headers
app.use(helmet());

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

// Start de server
app.listen(PORT, () => {
  logger.info(`Server draait op poort ${PORT}`);
});
