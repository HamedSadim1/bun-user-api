import path from "node:path";
import { logger } from "./logger";

const CLIENT_SCRIPTS = ["navbar", "signup", "users-list"] as const;

/**
 * De browser kan geen TypeScript laden, dus compileren we de clientscripts
 * uit client/*.ts naar public/*.js. De .js-bestanden zijn buildartefacten.
 */
export async function buildClientScripts(): Promise<void> {
  const result = await Bun.build({
    entrypoints: CLIENT_SCRIPTS.map((name) => path.resolve("client", `${name}.ts`)),
    outdir: path.resolve("public"),
    target: "browser",
    naming: "[name].js",
  });

  if (!result.success) {
    for (const log of result.logs) {
      logger.error({ log }, "Bouwfout in clientscript");
    }
    throw new Error("Clientscripts konden niet worden gebouwd");
  }

  logger.info({ scripts: CLIENT_SCRIPTS.length }, "Clientscripts gebouwd");
}

if (import.meta.main) {
  buildClientScripts().catch((error) => {
    logger.error({ error }, "Clientscripts konden niet worden gebouwd");
    process.exit(1);
  });
}
