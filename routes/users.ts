import { Router } from "express";
import { z } from "zod";
import { getDb } from "../lib/database";
import { logger } from "../lib/logger";
import { UserSchema } from "../schemas/user";

const router = Router();
const MAX_USERS = 100;

// GET all users
router.get("/getUsers", async (_req, res) => {
  try {
    const db = getDb();
    const data = await db.collection("users").find({}).limit(MAX_USERS).toArray();
    res.send(data);
  } catch (error) {
    logger.error({ error }, "Fout bij ophalen gebruikers");
    res.status(500).send({ error: "Interne serverfout" });
  }
});

// POST new user
router.post("/addUser", async (req, res) => {
  try {
    const validated = UserSchema.parse(req.body);
    logger.info({ email: validated.email, username: validated.username }, "Nieuwe gebruiker");

    const db = getDb();
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
  }
});

export default router;
