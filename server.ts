import cors from "cors";
import express from "express";
import helmet from "helmet";
import { MongoClient } from "mongodb";
import pino from "pino";
import { z } from "zod";

const app = express();
const PORT = 5050;

// Pino logger voor gestructureerde logging
const logger = pino(
  process.env.NODE_ENV === "production"
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      },
);

// Security headers (XSS, clickjacking, etc.)
app.use(helmet());

// CORS voor cross-origin requests
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  }),
);

// Middleware voor body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// MongoDB connectie
const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:qwerty@mongo:27017";
const client = new MongoClient(MONGO_URL);

// Zod schema voor gebruikersvalidatie
const UserSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  username: z.string().min(2, "Gebruikersnaam moet minstens 2 karakters bevatten").max(50),
  password: z.string().min(6, "Wachtwoord moet minstens 6 karakters bevatten"),
});

// GET all users
app.get("/getUsers", async (_req, res) => {
  try {
    await client.connect();
    logger.info("Verbonden met MongoDB");

    const db = client.db("apnacollege-db");
    const data = await db.collection("users").find({}).toArray();

    res.send(data);
  } catch (error) {
    logger.error({ error }, "Fout bij ophalen gebruikers");
    res.status(500).send({ error: "Interne serverfout" });
  } finally {
    await client.close();
  }
});

// POST new user
app.post("/addUser", async (req, res) => {
  try {
    // Valideer de request body met Zod
    const validated = UserSchema.parse(req.body);
    logger.info({ email: validated.email, username: validated.username }, "Nieuwe gebruiker");

    await client.connect();
    logger.info("Verbonden met MongoDB");

    const db = client.db("apnacollege-db");
    const data = await db.collection("users").insertOne(validated);

    logger.info({ insertedId: data.insertedId }, "Gebruiker toegevoegd");

    res.status(201).send({ insertedId: data.insertedId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ issues: error.issues }, "Validatiefout");
      res.status(400).send({ error: "Validatiefout", details: error.issues });
      return;
    }

    logger.error({ error }, "Fout bij toevoegen gebruiker");
    res.status(500).send({ error: "Interne serverfout" });
  } finally {
    await client.close();
  }
});

// Start de server
app.listen(PORT, () => {
  logger.info(`Server draait op poort ${PORT}`);
});
