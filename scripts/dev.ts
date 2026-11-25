/**
 * `bun start` — start de API én de Vite-devserver in één proces.
 *
 * Draait er al een API op poort 5050 (bijvoorbeeld de container), dan slaan we
 * de lokale API over en proxyt Vite naar die bestaande API. Is de poort vrij,
 * dan starten beide processen.
 */
import { createServer } from "vite";
import { logger } from "../server/lib/logger";

const API_PORT = 5050;
const API_URL = `http://localhost:${API_PORT}`;

// De API-server moet weten dat hij niet in productie draait
process.env.NODE_ENV ??= "development";

/** Herkent een API die al draait aan het antwoord van /getUsers. */
async function apiIsRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/getUsers`, { signal: AbortSignal.timeout(1500) });
    const body = (await response.json()) as { users?: unknown };
    return response.ok && Array.isArray(body.users);
  } catch {
    return false;
  }
}

if (await apiIsRunning()) {
  logger.info(
    `API draait al op ${API_URL} — lokale API overgeslagen. Stop de container voor een lokale API: docker compose -f mongodb.yaml stop app`,
  );
} else {
  // server/index.ts start zichzelf zodra hij geïmporteerd wordt
  await import("../server/index");
}

const vite = await createServer();
await vite.listen();
vite.printUrls();

const frontend = vite.resolvedUrls?.local[0] ?? "http://localhost:5173/";
logger.info(`Frontend draait op ${frontend} (API-proxy → ${API_URL})`);
