# 🚀 Bun User API

Een REST API voor gebruikersbeheer, gebouwd met **Bun**, **Express 5**, **MongoDB** en **TypeScript**.

[![CI](https://github.com/HamedSadim1/bun-user-api/actions/workflows/ci.yml/badge.svg)](https://github.com/HamedSadim1/bun-user-api/actions/workflows/ci.yml)

---

## 📁 Projectstructuur

```
bun-user-api/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI (typecheck + build)
├── .husky/
│   ├── pre-commit              # lint-staged + typecheck
│   └── commit-msg              # commitlint conventionele commits
├── client/
│   ├── index.html              # Signup pagina (Vite entry)
│   ├── users.html              # Gebruikersoverzicht (Vite entry)
│   ├── style.css               # Styling (via Vite gebundeld)
│   ├── navbar.ts               # Gedeelde navigatie
│   ├── signup.ts               # Signup formulier + client-side validatie
│   └── users-list.ts           # Gebruikersoverzicht (fetch + states)
├── server/
│   ├── index.ts                # Express app: JSON-API, optioneel dist/
│   ├── lib/
│   │   ├── database.ts         # MongoDB singleton connectie
│   │   └── logger.ts           # Pino gestructureerde logging
│   ├── routes/
│   │   └── users.ts            # User API routes
│   └── schemas/
│       └── user.ts             # Zod validatieschema
├── shared/
│   └── config.ts               # Poorten, API-routes, pagina's (één bron van waarheid)
├── dist/                       # Vite-build (gitignored)
├── vite.config.ts              # Vite MPA-config + dev-proxy naar de API
├── biome.json                  # Biome formatter/linter config
├── commitlint.config.js        # Commitlint config
├── .lintstagedrc.mjs           # Lint-staged config
├── Dockerfile                  # Docker image
├── mongodb.yaml                # Docker Compose (MongoDB + Mongo Express + App)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tech Stack

| Onderdeel            | Technologie en versie                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Runtime**          | [Bun](https://bun.sh/) 1.4                                                                                  |
| **Framework**        | [Express 5](https://expressjs.com/) 5.3                                                                     |
| **Taal**             | [TypeScript](https://www.typescriptlang.org/) 5.9                                                           |
| **Bundler**          | [Vite](https://vite.dev/) 8                                                                                 |
| **Database**         | [MongoDB](https://www.mongodb.com/) 6 (native driver)                                                       |
| **Validatie**        | [Zod](https://zod.dev/) 4                                                                                   |
| **Security**         | [Helmet](https://helmetjs.github.io/) 8                                                                     |
| **CORS**             | [cors](https://github.com/expressjs/cors) 2                                                                 |
| **Logging**          | [Pino](https://getpino.io/) 10                                                                              |
| **Formatter/Linter** | [Biome](https://biomejs.dev/) 2.6                                                                           |
| **Git Hooks**        | [Husky](https://typicode.github.io/husky/) 9 + [lint-staged](https://github.com/lint-staged/lint-staged) 17 |
| **Commitlint**       | [@commitlint/config-conventional](https://commitlint.js.org/) 21                                            |
| **CI/CD**            | GitHub Actions                                                                                              |
| **Container**        | Docker + Docker Compose                                                                                     |

---

## 📋 Vereisten

- **[Bun](https://bun.sh/)** ≥ 1.4
- **MongoDB** (lokaal of via Docker)
- **Git**

---

## ⚡ Snel starten

### 1. Clone de repo

```bash
git clone https://github.com/HamedSadim1/bun-user-api.git
cd bun-user-api
```

### 2. Installeer dependencies

```bash
bun install
```

> Dit activeert automatisch de Husky git hooks via het `prepare` script.

### 3. Start MongoDB

**Optie A: Docker** (aanbevolen)

```bash
docker compose -f mongodb.yaml up -d mongo
```

**Optie B: Lokale MongoDB installatie**

Zorg dat MongoDB draait op `localhost:27017`.

### 4. Start de app

```bash
bun start
```

`bun start` start beide processen in één commando: de Express-API op
**http://localhost:5050** en de Vite-devserver op **http://localhost:5173**.
Open voor ontwikkeling **http://localhost:5173** — daar zit HMR.

Poort 5050 is een pure JSON-API: `GET /` geeft een index met de beschikbare
endpoints, de pagina's komen van Vite op 5173. Express serveert de build uit
`dist/` alleen als je dat expliciet aanzet met `SERVE_FRONTEND=1`.

Draait er al een API op poort 5050 (bijvoorbeeld de container), dan slaat
`bun start` de lokale API over en proxyt Vite naar die bestaande API. Wil je
juist je eigen servercode draaien, stop de container dan eerst met
`docker compose -f mongodb.yaml stop app`.

Los draaien kan ook:

```bash
bun run server  # alleen de API op 5050
bun run dev     # alleen de Vite-devserver op 5173
```

Voor een productiebuild zonder Vite:

```bash
bun run build
SERVE_FRONTEND=1 NODE_ENV=production bun run server  # Express serveert dist/ op 5050
```

Zonder `SERVE_FRONTEND=1` bedient Express alleen de API: `/` geeft dan JSON en
`/users` bestaat niet.

In productie (`NODE_ENV=production`) stopt de server als `dist/index.html`
ontbreekt, met een verwijzing naar `bun run build`. In development is dat geen
blokkade, want Vite serveert de frontend.

De Vite dev-server serveert de bronnen uit `client/` met HMR; de API draait in
het tweede proces. Vite proxyt `/addUser` en `/getUsers` naar poort 5050 en
mapt `/users` intern naar `client/users.html`. `/users.html` is nergens de
canonieke URL: dev en productie sturen een `301` naar `/users`.

De API staat op **http://localhost:5050**, de dev-server op
**http://localhost:5173**.

> `bun start` controleert bij het opstarten of `dist/index.html` bestaat. Draai
> daarom bij de eerste keer (en na een verse clone) één keer `bun run build`.

### 5. Open de signup pagina

```
http://localhost:5173
```

Het gebruikersoverzicht staat op **http://localhost:5173/users**. Dezelfde
pagina's zijn ook op poort 5050 te bereiken; die poort serveert de gebouwde
versie uit `dist/`.

---

## 🔧 Omgevingsvariabelen

| Variabele     | Default                                  | Beschrijving                    |
| ------------- | ---------------------------------------- | ------------------------------- |
| `MONGO_URL`   | `mongodb://admin:qwerty@localhost:27017` | MongoDB connectiestring         |
| `CORS_ORIGIN` | `*`                                      | Toegestane origin voor CORS     |
| `NODE_ENV`    | —                                        | `production` voor raw JSON logs |

---

## 📡 API Endpoints

### `GET /`

Geeft een JSON-index met de naam, status en beschikbare endpoints.

```json
{
  "name": "bun-user-api",
  "status": "ok",
  "endpoints": {
    "GET /getUsers": "Gebruikers (max 100) plus het totaal",
    "POST /addUser": "Nieuwe gebruiker toevoegen (JSON of form-encoded)"
  }
}
```

Met `SERVE_FRONTEND=1` serveert deze route in plaats daarvan de signup pagina
uit de Vite-build (`dist/index.html`, bron: `client/index.html`).

### `GET /users`

Serveert het gebruikersoverzicht uit de Vite-build (`dist/users.html`, bron: `client/users.html`). Dit is de canonieke URL van het overzicht. Alleen met `SERVE_FRONTEND=1`; anders komt het overzicht van Vite op poort 5173.

### `GET /users.html`

Verwijst permanent (`301`) naar `/users`, zodat er één canonieke URL is. Alleen
met `SERVE_FRONTEND=1`.

### `GET /getUsers`

Haalt gebruikers op (maximaal 100) plus het totaal aantal gebruikers, zodat de UI kan tonen hoeveel er van het totaal zichtbaar is. Het `password`-veld wordt nooit teruggegeven.

```bash
curl http://localhost:5050/getUsers
```

**Respons** `200 OK`:

```json
{
  "users": [
    {
      "_id": "64a1b2c3...",
      "email": "jane@example.com",
      "username": "Jane"
    }
  ],
  "total": 1,
  "limit": 100
}
```

---

### `POST /addUser`

Voegt een nieuwe gebruiker toe. Accepteert `application/json` en `application/x-www-form-urlencoded`.

```bash
# JSON body
curl -X POST http://localhost:5050/addUser \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","username":"Jane","password":"geheim123"}'

# Form-encoded
curl -X POST http://localhost:5050/addUser \
  -d "email=jane@example.com&username=Jane&password=geheim123"
```

**Validatieregels** (Zod):

- `email`: geldig e-mailadres
- `username`: 2–50 karakters
- `password`: minimaal 6 karakters

**Succes** `201 Created`:

```json
{ "insertedId": "64a1b2c3..." }
```

**Validatiefout** `400 Bad Request`:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_format",
      "format": "email",
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

**Duplicaat** `409 Conflict`:

```json
{ "error": "A user with this email already exists", "field": "email" }
```

---

## 🐳 Docker

De `mongodb.yaml` start MongoDB, Mongo Express (web UI) en de applicatie:

```bash
# Alles starten
docker compose -f mongodb.yaml up -d

# Alleen MongoDB
docker compose -f mongodb.yaml up -d mongo
```

| Service           | URL                   |
| ----------------- | --------------------- |
| **API**           | http://localhost:5050 |
| **Mongo Express** | http://localhost:8081 |

De app-image bouwt de frontend mee (`bun run build` in de `Dockerfile`). Na een
wijziging in `client/` of de HTML-bestanden is een herbouw nodig:

```bash
docker compose -f mongodb.yaml up -d --build app
```

Binnen Compose wijst `MONGO_URL` naar de hostnaam `mongo`. Draai je de server
buiten Docker, gebruik dan `mongodb://admin:qwerty@localhost:27017`.

De container is standaard een pure API. Wil je dat de container ook de UI
serveert, zet dan `SERVE_FRONTEND: "1"` bij de `environment` van de app in
`mongodb.yaml` en bouw de image opnieuw.

---

## 🧪 Scripts

| Commando            | Beschrijving                                  |
| ------------------- | --------------------------------------------- |
| `bun start`         | Start de API én de Vite-devserver in één keer |
| `bun run server`    | Alleen de Express-server (serveert `dist/`)   |
| `bun run dev`       | Vite dev-server met HMR en API-proxy          |
| `bun run build`     | Bouwt de frontend naar `dist/`                |
| `bun run format`    | Formatteert alle code met Biome               |
| `bun run lint`      | Controleert code met Biome                    |
| `bun run typecheck` | TypeScript typecheck (`tsc --noEmit`)         |

---

## 📦 Dependencies

De dependencies staan in `package.json` en zijn vastgelegd in `bun.lock`. Bijwerken kan met:

```bash
bun update           # binnen de huidige semver-ranges
bun update --latest  # naar de nieuwste versies (inclusief major bumps)
bun outdated         # toon verouderde packages
```

---

## 🔒 Git Hooks & Developer Tooling

### Pre-commit hook

Bij elke commit wordt automatisch:

1. **lint-staged** — Biome format + lint op staged `.ts`, `.js` en `.json` bestanden
2. **TypeScript typecheck** (`tsc --noEmit`) zodra er een `.ts` bestand is gestaged

### Commit-msg hook

Commit berichten moeten voldoen aan de [Conventional Commits](https://www.conventionalcommits.org/) standaard:

```
feat: voeg gebruikersvalidatie toe
fix: repareer MongoDB connectie timeout
chore: update dependencies
refactor: splits de server op in modules
```

### Handmatig formatteren/linten

```bash
bun run format     # alles formatteren
bun run lint       # alles checken
bun run typecheck  # TypeScript checken
```

---

## 🤖 CI/CD

Bij elke **push** en **pull request** naar `main` draait GitHub Actions automatisch:

- ✅ `bun install`
- ✅ `tsc --noEmit` typecheck
