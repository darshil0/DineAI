import { restaurants } from '../data/restaurants.js';
import { generateEmbeddingSkill } from '../skills/generateEmbedding.js';
import { vectorDb, VectorRecord } from '../lib/vectorDb.js';
import { embeddingCache } from '../lib/cache.js';
import { withRetry } from '../lib/utils.js';

// Helper to chunk an array
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function ingestRestaurants() {
  console.log('Starting restaurant ingestion into Vector DB...');

  const existingCount = await vectorDb.count();
  if (existingCount > 0) {
    console.log(`Vector DB already has ${existingCount} records. Skipping ingestion.`);
    return;
  }

  const chunks = chunk(restaurants, 5); // Process in batches of 5
  let processedCount = 0;

  for (const batch of chunks) {
    const batchResults = await Promise.all(
      batch.map(async (r) => {
        const restaurantId = `${r.name}-${r.neighborhood}`.toLowerCase().replace(/\s+/g, '-');

        // Try to get from cache first
        let embedding = embeddingCache.get(restaurantId);

        if (!embedding) {
          const textToEmbed = `
          Name: ${r.name}
          Cuisine: ${r.cuisine}
          Price Tier: ${r.price_tier}
          Neighborhood: ${r.neighborhood}
          Tags: ${r.tags.join(', ')}
          Description: ${r.description}
          ${r.address ? `Address: ${r.address}` : ''}
          ${r.phone ? `Phone: ${r.phone}` : ''}
          ${r.hours ? `Hours: ${r.hours}` : ''}
        `.trim();

          try {
            const result = await withRetry(() => generateEmbeddingSkill.run({ text: textToEmbed }));
            embedding = result.embedding;
            // Store in cache
            embeddingCache.set(restaurantId, embedding);
            console.log(`Generated and Cached: ${r.name}`);
          } catch (e) {
            console.error(`Failed to embed ${r.name}:`, e);
            return null;
          }
        } else {
          console.log(`Loaded from Cache: ${r.name}`);
        }

        if (embedding) {
          return {
            id: restaurantId,
            embedding,
            metadata: r,
          };
        }
        return null;
      }),
    );

    const validRecords = batchResults.filter((r): r is VectorRecord => r !== null);
    if (validRecords.length > 0) {
      await vectorDb.upsert(validRecords);
      processedCount += validRecords.length;
    }
    console.log(`Batch processed (${processedCount}/${restaurants.length})...`);
  }

  console.log(`Ingestion complete. Total records in Vector DB: ${await vectorDb.count()}`);
  vectorDb.saveToIndex();
}
