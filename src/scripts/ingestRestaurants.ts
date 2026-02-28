import { restaurants } from "../data/restaurants.js";
import { generateEmbeddingSkill } from "../skills/generateEmbedding.js";
import { vectorDb, VectorRecord } from "../lib/vectorDb.js";
import { logger } from "../lib/logger.js";

export async function ingestRestaurants() {
  logger.info("Ingestion", "Starting restaurant ingestion into Vector DB...");

  const existingCount = await vectorDb.count();
  if (existingCount > 0) {
    logger.info("Ingestion", `Vector DB already has ${existingCount} records. Skipping ingestion.`);
    return;
  }

  const records: VectorRecord[] = [];

  const BATCH_SIZE = 5;
  for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
    const batch = restaurants.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (r) => {
      const textToEmbed = `
        Name: ${r.name}
        Cuisine: ${r.cuisine}
        Price Tier: ${r.price_tier}
        Neighborhood: ${r.neighborhood}
        Tags: ${r.tags?.join(", ") || "None"}
        Description: ${r.description}
      `.trim();

      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts) {
        try {
          const { embedding } = await generateEmbeddingSkill.run({
            text: textToEmbed,
          });
          records.push({
            id: r.id || r.name.toLowerCase().replace(/\s+/g, "-"),
            embedding,
            metadata: r,
          });
          logger.info("Ingestion", `Embedded: ${r.name}`);
          success = true;
        } catch (e) {
          attempts++;
          if (attempts < maxAttempts) {
            const delay = Math.pow(2, attempts) * 200;
            logger.warn("Ingestion", `Retry ${attempts}/${maxAttempts} for ${r.name} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            logger.warn("Ingestion", `Failed to embed ${r.name} after ${maxAttempts} attempts: ${e}`);
          }
        }
      }
    }));

    if (i + BATCH_SIZE < restaurants.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  if (records.length > 0) {
    await vectorDb.upsert(records);
  } else {
    logger.error("Ingestion", "Critical: No records successfully embedded.");
  }
  logger.info("Ingestion", `Ingestion complete. Total records in Vector DB: ${await vectorDb.count()}`);
}
