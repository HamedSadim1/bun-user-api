import { Router } from "express";
import { z } from "zod";
import { client, DB_NAME } from "../lib/database";
import { logger } from "../lib/logger";
import { UserSchema } from "../schemas/user";

const router = Router();

// GET all users
router.get("/getUsers", async (_req, res) => {
  try {
    await client.connect();
    logger.info("Verbonden met MongoDB");

    const db = client.db(DB_NAME);
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
router.post("/addUser", async (req, res) => {
  try {
    const validated = UserSchema.parse(req.body);
    logger.info({ email: validated.email, username: validated.username }, "Nieuwe gebruiker");

    await client.connect();
    logger.info("Verbonden met MongoDB");

    const db = client.db(DB_NAME);
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

export default router;
