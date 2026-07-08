export default {
  "*.ts": ["bunx biome check --write --no-errors-on-unmatched", () => "bun run tsc --noEmit"],
  "*.{js,json}": "bunx biome check --write --no-errors-on-unmatched",
};
