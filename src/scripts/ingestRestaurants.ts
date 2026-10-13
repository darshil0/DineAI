import { restaurants, Restaurant } from '../data/restaurants.js';
import { generateEmbeddingSkill } from '../skills/generateEmbedding.js';
import { vectorDb, VectorRecord } from '../lib/vectorDb.js';
import { embeddingCache } from '../lib/cache.js';
import { withRetry } from '../lib/utils.js';
import { MODELS } from '../config/models.js';

// Helper to chunk an array
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function generateCacheKey(r: Restaurant): string {
  const restaurantId = `${r.name}-${r.neighborhood}`.toLowerCase().replace(/\s+/g, '-');
  const addressPart = (r.address || '').toLowerCase().replace(/\s+/g, '-');
  const cuisinePart = (r.cuisine || '').toLowerCase().replace(/\s+/g, '-');
  return `${MODELS.EMBEDDING}:${restaurantId}:${addressPart}:${cuisinePart}`;
}

export async function ingestRestaurants(options?: { rebuild?: boolean }) {
  const isRebuild = options?.rebuild || process.argv.includes('--rebuild');
  console.log(`Starting restaurant ingestion into Vector DB... (rebuild=${isRebuild})`);

  if (isRebuild) {
    console.log('Rebuild flag detected. Clearing existing vector database...');
    vectorDb.clear();
  }

  // Identify missing or updated restaurants
  const existingRecords = vectorDb.records;
  const existingMap = new Map<string, VectorRecord>(existingRecords.map((rec) => [rec.id, rec]));

  const missingRestaurants = restaurants.filter((r) => {
    const restaurantId = `${r.name}-${r.neighborhood}`.toLowerCase().replace(/\s+/g, '-');
    const existing = existingMap.get(restaurantId);
    if (!existing) return true;
    // Check if metadata has changed (e.g. description or cuisine)
    return JSON.stringify(existing.metadata) !== JSON.stringify(r);
  });

  if (missingRestaurants.length === 0) {
    console.log(
      `Vector DB is fully up-to-date with ${existingRecords.length} records. Skipping ingestion.`,
    );
    return;
  }

  console.log(
    `Incremental ingestion required for ${missingRestaurants.length}/${restaurants.length} records.`,
  );

  const chunks = chunk(missingRestaurants, 5); // Process in batches of 5
  let processedCount = 0;

  for (const batch of chunks) {
    const batchResults = await Promise.all(
      batch.map(async (r) => {
        const restaurantId = `${r.name}-${r.neighborhood}`.toLowerCase().replace(/\s+/g, '-');
        const cacheKey = generateCacheKey(r);

        // Try to get from cache first using unique model + content key
        let embedding = embeddingCache.get(cacheKey);

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
            embeddingCache.set(cacheKey, embedding);
            console.log(`Generated and Cached embedding for: ${r.name}`);
          } catch (e) {
            console.error(`Failed to embed ${r.name}:`, e);
            return null;
          }
        } else {
          console.log(`Loaded embedding from Cache: ${r.name}`);
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
    console.log(`Batch processed (${processedCount}/${missingRestaurants.length})...`);
  }

  console.log(`Ingestion complete. Total records in Vector DB: ${await vectorDb.count()}`);
  vectorDb.saveToIndex();
}

// Allow CLI execution directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith('ingestRestaurants.ts') ||
    process.argv[1].endsWith('ingestRestaurants.js'))
) {
  ingestRestaurants().catch((err) => {
    console.error('Ingestion failed:', err);
    process.exit(1);
  });
}
