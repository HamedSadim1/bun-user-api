import { Router } from "express";
import { z } from "zod";
import { API_ROUTES, MAX_USERS } from "../../shared/config";
import { getDb } from "../lib/database";
import { logger } from "../lib/logger";
import { UserSchema } from "../schemas/user";

const router = Router();

// GET all users
router.get(API_ROUTES.users, async (_req, res) => {
  try {
    const db = getDb();
    const collection = db.collection("users");
    // Het totaal maakt de MAX_USERS-limiet zichtbaar voor de client
    const [users, total] = await Promise.all([
      collection
        .find({}, { projection: { password: 0 } })
        .limit(MAX_USERS)
        .toArray(),
      collection.countDocuments(),
    ]);
    res.send({ users, total, limit: MAX_USERS });
  } catch (error) {
    logger.error({ error }, "Fout bij ophalen gebruikers");
    res.status(500).send({ error: "Internal server error" });
  }
});

// POST new user
router.post(API_ROUTES.addUser, async (req, res) => {
  try {
    const validated = UserSchema.parse(req.body);

    const db = getDb();
    const collection = db.collection("users");

    // Check for duplicate email or username
    const exists = await collection.findOne({
      $or: [{ email: validated.email }, { username: validated.username }],
    });
    if (exists) {
      const field = exists.email === validated.email ? "email" : "username";
      res.status(409).send({ error: `A user with this ${field} already exists`, field });
      return;
    }

    // Hash password before storing
    const hashedPassword = await Bun.password.hash(validated.password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    validated.password = hashedPassword;

    logger.info({ email: validated.email, username: validated.username }, "Nieuwe gebruiker");
    const data = await collection.insertOne(validated);

    logger.info({ insertedId: data.insertedId }, "Gebruiker toegevoegd");
    res.status(201).send({ insertedId: data.insertedId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ issues: error.issues }, "Validatiefout");
      res.status(400).send({ error: "Validation failed", details: error.issues });
      return;
    }

    logger.error({ error }, "Fout bij toevoegen gebruiker");
    res.status(500).send({ error: "Internal server error" });
  }
});

export default router;
