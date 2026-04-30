import { restaurants } from "../data/restaurants.js";
import { generateEmbeddingSkill } from "../skills/generateEmbedding.js";
import { vectorDb, VectorRecord } from "../lib/vectorDb.js";
import { embeddingCache } from "../lib/cache.js";

// Helper to chunk an array
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function ingestRestaurants() {
  console.log("Starting restaurant ingestion into Vector DB...");
  
  const existingCount = await vectorDb.count();
  if (existingCount > 0) {
    console.log(`Vector DB already has ${existingCount} records. Skipping ingestion.`);
    return;
  }

  const chunks = chunk(restaurants, 5); // Process in batches of 5
  let processedCount = 0;

  for (const batch of chunks) {
    const records: VectorRecord[] = [];
    
    await Promise.all(batch.map(async (r) => {
      const restaurantId = r.id || r.name.toLowerCase().replace(/\s+/g, '-');
      
      // Try to get from cache first
      let embedding = embeddingCache.get(restaurantId);
      
      if (!embedding) {
        const textToEmbed = `
          Name: ${r.name}
          Cuisine: ${r.cuisine}
          Price Tier: ${r.price_tier}
          Neighborhood: ${r.neighborhood}
          Tags: ${r.tags.join(", ")}
          Description: ${r.description}
          ${r.address ? `Address: ${r.address}` : ""}
          ${r.phone ? `Phone: ${r.phone}` : ""}
          ${r.hours ? `Hours: ${r.hours}` : ""}
        `.trim();

        try {
          const result = await generateEmbeddingSkill.run({ text: textToEmbed });
          embedding = result.embedding;
          // Store in cache
          embeddingCache.set(restaurantId, embedding);
          console.log(`Generated and Cached: ${r.name}`);
        } catch (e) {
          console.error(`Failed to embed ${r.name}`, e);
          return;
        }
      } else {
        console.log(`Loaded from Cache: ${r.name}`);
      }

      if (embedding) {
        records.push({
          id: restaurantId,
          embedding,
          metadata: r
        });
      }
      processedCount++;
    }));
    
    await vectorDb.upsert(records);
    console.log(`Batch processed (${processedCount}/${restaurants.length})...`);
  }
  
  console.log(`Ingestion complete. Total records in Vector DB: ${await vectorDb.count()}`);
}
