// Importeer Express en maak een app-instance
import express from "express";
const app = express();
// MongoDB client importeren (native driver)
import { MongoClient } from "mongodb";

// Poort waarop de server luistert
const PORT = 5050;

// Middleware om formulier-encoded bodies (application/x-www-form-urlencoded) te parsen
app.use(express.urlencoded({ extended: true }));
// Middleware om JSON bodies te parsen (voor POST requests met application/json)
app.use(express.json());
// Serveer statische bestanden (index.html, style.css, etc.) vanuit de `public` map
app.use(express.static("public"));

// MongoDB connectie string: kan overschreven worden met env var MONGO_URL
const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:qwerty@mongo:27017";
// Herbruikbare MongoClient instantie - let op: connect/close wordt in handlers aangeroepen
const client = new MongoClient(MONGO_URL);

//GET all users
// Route: GET /getUsers
// Haalt alle gebruikers op uit de `users` collectie en stuurt deze terug als JSON
app.get("/getUsers", async (req, res) => {
  // Maak verbinding met MongoDB
  await client.connect();
  console.log("Connected successfully to server");

  // Selecteer database en collectie
  const db = client.db("apnacollege-db");
  // Query: alle documenten in de collectie ophalen
  const data = await db.collection("users").find({}).toArray();

  // Sluit de connectie en stuur de data terug
  client.close();
  res.send(data);
});

//POST new user
// Route: POST /addUser
// Ontvangt form-data (of JSON als middleware is aangepast) en voegt een nieuwe gebruiker toe aan de DB
app.post("/addUser", async (req, res) => {
  // Het nieuwe gebruiker-object komt uit de body van de request
  const userObj = req.body;
  console.log(req.body);

  // Verbinden met MongoDB, selectie van database en collectie
  await client.connect();
  console.log("Connected successfully to server");

  const db = client.db("apnacollege-db");
  // Insert het nieuwe document in de `users` collectie
  const data = await db.collection("users").insertOne(userObj);
  console.log(data);
  console.log("data inserted in DB");

  // Sluit de connectie. Er wordt geen response-body teruggestuurd in de originele code,
  // dus we sturen hier een korte status zodat de client weet dat het gelukt is.
  client.close();
  res.status(201).send({ insertedId: data.insertedId });
});

// Start de Express-server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
