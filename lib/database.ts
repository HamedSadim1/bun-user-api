import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:qwerty@mongo:27017";

export const client = new MongoClient(MONGO_URL);
export const DB_NAME = "apnacollege-db";
