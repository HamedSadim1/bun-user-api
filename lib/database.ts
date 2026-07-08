import type { Db } from "mongodb";
import { MongoClient } from "mongodb";
import { logger } from "./logger";

const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:qwerty@mongo:27017";
const DB_NAME = "apnacollege-db";

const client = new MongoClient(MONGO_URL);

let db: Db;

export async function connectDB(): Promise<void> {
  await client.connect();
  db = client.db(DB_NAME);
  logger.info("Verbonden met MongoDB");
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database niet verbonden — roep connectDB() eerst aan");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  await client.close();
  logger.info("MongoDB verbinding gesloten");
}
