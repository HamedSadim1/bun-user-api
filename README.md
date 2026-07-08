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
│   ├── database.ts             # MongoDB singleton connectie
│   └── logger.ts               # Pino gestructureerde logging
├── public/
│   ├── index.html              # Signup pagina
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

| Onderdeel           | Technologie                          |
|---------------------|--------------------------------------|
| **Runtime**         | [Bun](https://bun.sh/)               |
| **Framework**       | [Express 5](https://expressjs.com/)  |
| **Taal**            | TypeScript                           |
| **Database**        | MongoDB (native driver)              |
| **Validatie**       | [Zod](https://zod.dev/)              |
| **Security**        | [Helmet](https://helmetjs.github.io/)|
| **CORS**            | [cors](https://github.com/expressjs/cors) |
| **Logging**         | [Pino](https://getpino.io/)          |
| **Formatter/Linter**| [Biome](https://biomejs.dev/)        |
| **Git Hooks**       | [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) |
| **Commitlint**      | [@commitlint/config-conventional](https://commitlint.js.org/) |
| **CI/CD**           | GitHub Actions                       |
| **Container**       | Docker + Docker Compose              |

---

## 📋 Vereisten

- **[Bun](https://bun.sh/)** ≥ 1.x
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

---

## 🔧 Omgevingsvariabelen

| Variabele   | Default                                        | Beschrijving              |
|-------------|------------------------------------------------|---------------------------|
| `MONGO_URL` | `mongodb://admin:qwerty@localhost:27017`       | MongoDB connectiestring   |
| `NODE_ENV`  | —                                              | `production` voor raw JSON logs |

---

## 📡 API Endpoints

### `GET /getUsers`

Haalt alle gebruikers op.

```bash
curl http://localhost:5050/getUsers
```

**Respons** `200 OK`:
```json
[
  {
    "_id": "64a1b2c3...",
    "email": "jane@example.com",
    "username": "Jane Doe",
    "password": "hashed..."
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
  "error": "Validatiefout",
  "details": [
    {
      "code": "invalid_string",
      "path": ["email"],
      "message": "Ongeldig e-mailadres"
    }
  ]
}
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

| Service         | URL                        |
|-----------------|----------------------------|
| **API**         | http://localhost:5050      |
| **Mongo Express**| http://localhost:8081      |

---

## 🧪 Scripts

| Commando            | Beschrijving                              |
|---------------------|-------------------------------------------|
| `bun start`         | Start de server                           |
| `bun run format`    | Formatteert alle code met Biome           |
| `bun run lint`      | Controleert code met Biome                |
| `bun run typecheck` | TypeScript typecheck (`tsc --noEmit`)     |

---

## 🔒 Git Hooks & Developer Tooling

### Pre-commit hook

Bij elke commit wordt automatisch:

1. **lint-staged** — Biome format + lint op staged `.ts`, `.js`, `.json` bestanden
2. **TypeScript typecheck** (`tsc --noEmit`)

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

Bij elke **pull request** naar `main` draait GitHub Actions automatisch:

- ✅ `bun install`
- ✅ `tsc --noEmit` typecheck

---
