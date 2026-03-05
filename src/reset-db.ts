import { logger } from "./lib/logger.js";

/**
 * Note: The Vector DB used in DineAI is in-memory.
 * This script exists to document that restarting the server is the primary
 * way to clear or reset the database state.
 */
async function main() {
  logger.info("Database", "DineAI uses an in-memory Vector DB (src/lib/vectorDb.ts).");
  logger.info("Database", "To reset the database, simply restart the Node.js process.");
  logger.info("Database", "All restaurant embeddings will be re-generated on the next startup if the DB is empty.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
