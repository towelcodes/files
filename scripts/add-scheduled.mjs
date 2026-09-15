// Post-build step for @sveltejs/adapter-cloudflare.
//
// The adapter generates `.svelte-kit/cloudflare/_worker.js` from a fixed
// template that only exports a `fetch` handler, so a cron trigger configured
// in wrangler.jsonc fails with "Handler does not export a scheduled()
// function". This script appends a `scheduled` handler to the generated
// worker, which deletes expired files from R2 and their metadata rows from D1.
import { readFileSync, writeFileSync } from "node:fs";

const workerPath = ".svelte-kit/cloudflare/_worker.js";

const scheduledHandler = `
async function scheduled(_event, env, ctx) {
  const now = Date.now();

  const { results } = await env.db
    .prepare("SELECT key FROM files WHERE expires_at IS NOT NULL AND expires_at <= ?")
    .bind(now)
    .all();

  let deleted = 0;
  let failed = 0;

  for (const row of results) {
    try {
      await env.bucket.delete(row.key);
      await env.db.prepare("DELETE FROM files WHERE key = ?").bind(row.key).run();
      deleted++;
    } catch (e) {
      failed++;
      console.error("Failed to expire " + row.key, e);
    }
  }

  console.log("Expiry cleanup: " + deleted + " deleted, " + failed + " failed");
}

export { scheduled };
`;

let code;
try {
  code = readFileSync(workerPath, "utf8");
} catch {
  console.error(
    `Could not read ${workerPath} — did "vite build" run before this script?`,
  );
  process.exit(1);
}

writeFileSync(workerPath, code + "\n" + scheduledHandler);
console.log(`Appended scheduled handler to ${workerPath}`);