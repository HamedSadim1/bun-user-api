/**
 * Eén bron van waarheid voor poorten, routes, paginanamen, limieten en
 * validatieregels.
 *
 * Server, Vite-config, dev-script en clientscripts lezen hieruit, zodat een pad
 * of poort maar op één plek aangepast hoeft te worden. Dit bestand blijft vrij
 * van Node-imports, want de client bundelt het mee.
 */

export const API_PORT = 5050;
export const WEB_PORT = 5173;
export const API_ORIGIN = `http://localhost:${API_PORT}`;

/** API-paden: gebruikt door de routers, de Vite-proxy en de clients. */
export const API_ROUTES = {
  users: "/getUsers",
  addUser: "/addUser",
} as const;

/** Limiet van GET /getUsers, ook gebruikt in de API-index. */
export const MAX_USERS = 100;

/** De index die GET / teruggeeft. */
export const API_INDEX = [
  {
    method: "GET",
    path: API_ROUTES.users,
    description: `Gebruikers (max ${MAX_USERS}) plus het totaal`,
  },
  {
    method: "POST",
    path: API_ROUTES.addUser,
    description: "Nieuwe gebruiker toevoegen (JSON of form-encoded)",
  },
] as const;

/** Frontendpagina's: canonieke URL en het bijbehorende HTML-bestand. */
export const PAGES = {
  signup: { route: "/", file: "index.html" },
  users: { route: "/users", file: "users.html" },
} as const;

/** Oude URL's die permanent doorverwijzen naar de canonieke variant. */
export const CANONICAL_REDIRECTS: Readonly<Record<string, string>> = {
  [`/${PAGES.users.file}`]: PAGES.users.route,
};

// Limieten apart, zodat de foutmeldingen hieronder meebewegen met de getallen
const USERNAME = { min: 2, max: 50 } as const;
const PASSWORD = { min: 6 } as const;

/**
 * Validatieregels voor het formulier (`client/signup.ts`) en de API
 * (`server/schemas/user.ts`). Beide lezen dezelfde regels en teksten.
 */
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: "Email is required",
    invalid: "Please enter a valid email address",
    // Kortere variant voor de API-details (geen UI-tekst)
    apiInvalid: "Invalid email address",
  },
  username: {
    ...USERNAME,
    required: "Username is required",
    minMessage: `Username must be at least ${USERNAME.min} characters`,
    maxMessage: `Username must be at most ${USERNAME.max} characters`,
  },
  password: {
    ...PASSWORD,
    required: "Password is required",
    minMessage: `Password must be at least ${PASSWORD.min} characters`,
  },
} as const;
