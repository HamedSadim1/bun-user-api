# bun-user-api

Een compacte en duidelijke API voor gebruikersbeheer.

## Over dit project

Dit is een klein leerproject dat een Express-server en de MongoDB-native driver gebruikt. De server biedt twee eenvoudige endpoints om gebruikers op te halen en toe te voegen. De repository bevat ook een `public/` map met statische bestanden.

## Belangrijke bestanden

- `server.ts` — hoofdserver (Express)
- `public/` — statische bestanden (bijv. `index.html`, `style.css`)
- `package.json` — dependencies en metadata

## Vereisten

- [Bun](https://bun.sh/) (aanbevolen voor development)
- Node.js (voor productie of alternatieve workflow)
- MongoDB (lokaal of remote)

## Installatie

Installeer dependencies met Bun:

```bash
bun install
```

Als je geen Bun gebruikt:

```bash
npm install
# of
pnpm install
```

## Starten

Development met Bun (snel, direct):

```bash
bun run server.ts
```

Build en run met Node (productie-achtig):

```bash
npx tsc
node dist/server.js
```

## Configuratie

- `MONGO_URL` — MongoDB connectiestring. In de code staat een voorbeeld: `mongodb://admin:qwerty@mongo:27017`. Vervang door je eigen veilige URL.

## API Endpoints

- GET /getUsers

  - Retourneert alle gebruikers uit de `users` collectie.
  - Voorbeeld: `curl http://localhost:5050/getUsers`

- POST /addUser
  - Voegt een gebruiker toe. Huidige server ondersteunt form-encoded bodies (`express.urlencoded`).
  - Voorbeeld: `curl -X POST http://localhost:5050/addUser -d "name=Jan&email=jan@example.com"`
  - Respons: `201 Created` met `{ insertedId }`

## Tips & aanpassingen

- JSON-body support: voeg `app.use(express.json())` toe als je JSON wilt accepteren.
- MongoDB-verbinding: hergebruik de MongoClient in productie in plaats van connect/close per request.
