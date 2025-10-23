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

Development met Bun:

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
  - Voegt een gebruiker toe. De server ondersteunt form-encoded bodies (`express.urlencoded`) en JSON wanneer `express.json()` is ingeschakeld.
  - Voorbeeld: `curl -X POST http://localhost:5050/addUser -d "name=Jan&email=jan@example.com"`
  - Respons: `201 Created` met `{ insertedId }`

## Tips & aanpassingen

- JSON-body support: voeg `app.use(express.json())` toe als je JSON wilt accepteren.
- MongoDB-verbinding: hergebruik de MongoClient in productie in plaats van connect/close per request.

## Docker

Build de afbeelding (image) en start de services met Docker Compose:

```bash
docker build -t server:1.0 .
docker compose -f mongodb.yaml up -d
```

## Volumes / persistentie

Het `mongodb.yaml` bestand in deze repository gebruikt op dit moment een host bind-mount voor MongoDB data:

```yaml
services:
  mongo:
    volumes:
      - /c/Users/hamid/Downloads/data:/data/db
```

Dat betekent dat de MongoDB-data direct in de Windows-map `C:\Users\hamid\Downloads\data` wordt opgeslagen. Dit is handig voor development omdat je de bestanden direct op de host kunt bekijken.

Alternatief (aangeraden): gebruik een named volume beheerd door Docker/Compose. Pas `mongodb.yaml` aan naar:

Voordelen van een named volume:

- Portabiliteit en beheer via Docker (`docker volume ls`, `docker volume inspect mongo-data`).
- Geen direct host-pad nodig; Compose beheert opslaglocatie.

Commands:

```bash
# Toon alle Docker volumes
docker volume ls


```
