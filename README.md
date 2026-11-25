# 🚀 Bun User API

Een REST API voor gebruikersbeheer, gebouwd met **Bun**, **Express 5**, **MongoDB** en **TypeScript**.

[![CI](https://github.com/HamedSadim1/bun-user-api/actions/workflows/ci.yml/badge.svg)](https://github.com/HamedSadim1/bun-user-api/actions/workflows/ci.yml)

---

## 📁 Projectstructuur

```
bun-user-api/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── .husky/
│   ├── pre-commit              # lint-staged + typecheck
│   └── commit-msg              # commitlint conventionele commits
├── lib/
│   ├── build-client.ts         # Compileert public/*.ts naar public/*.js
│   ├── database.ts             # MongoDB singleton connectie
│   └── logger.ts               # Pino gestructureerde logging
├── public/
│   ├── index.html              # Signup pagina
│   ├── users.html              # Gebruikersoverzicht
│   ├── navbar.ts               # Gedeelde navigatie (bron)
│   ├── signup.ts               # Signup formulier + client-side validatie (bron)
│   ├── users-list.ts           # Gebruikersoverzicht (fetch + states) (bron)
│   └── style.css               # Styling
├── routes/
│   └── users.ts                # User API routes
├── schemas/
│   └── user.ts                 # Zod validatieschema
├── server.ts                   # Express app entry point
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

### 4. Start de server

```bash
bun run server.ts
```

Of via npm script:

```bash
bun start
```

De server start op **http://localhost:5050**.

### 5. Open de signup pagina

```
http://localhost:5050
```

Het gebruikersoverzicht staat op **http://localhost:5050/users**.

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

Serveert de signup pagina (`public/index.html`).

### `GET /users`

Serveert het gebruikersoverzicht (`public/users.html`).

### `GET /getUsers`

Haalt alle gebruikers op (maximaal 100). Het `password`-veld wordt nooit teruggegeven.

```bash
curl http://localhost:5050/getUsers
```

**Respons** `200 OK`:

```json
[
  {
    "_id": "64a1b2c3...",
    "email": "jane@example.com",
    "username": "Jane"
  }
]
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
{ "error": "A user with this email already exists" }
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

---

## 🧪 Scripts

| Commando            | Beschrijving                                |
| ------------------- | ------------------------------------------- |
| `bun start`         | Start de server (bouwt de clientscripts)    |
| `bun run build`     | Compileert `public/*.ts` naar `public/*.js` |
| `bun run format`    | Formatteert alle code met Biome             |
| `bun run lint`      | Controleert code met Biome                  |
| `bun run typecheck` | TypeScript typecheck (`tsc --noEmit`)       |

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
refactor: splits server.ts op in modules
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
