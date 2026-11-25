import type { Db } from "mongodb";
import { MongoClient } from "mongodb";
import { logger } from "./logger";

const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:qwerty@localhost:27017";
const DB_NAME = "apnacollege-db";

const client = new MongoClient(MONGO_URL);

let db: Db;

let closing = false;

client.on("serverClosed", () => {
  // Bij een gecontroleerde shutdown is dit geen fout
  if (!closing) logger.error("MongoDB verbinding onverwacht gesloten");
});

export async function connectDB(): Promise<void> {
  // Tijdens het verbinden mag een sluiting geen "onverwachte" fout opleveren
  closing = true;
  await client.connect();
  closing = false;
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
  closing = true;
  await client.close();
  logger.info("MongoDB verbinding gesloten");
}
