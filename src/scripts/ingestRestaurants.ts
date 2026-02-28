import { restaurants } from "../data/restaurants.js";
import { generateEmbeddingSkill } from "../skills/generateEmbedding.js";
import { vectorDb, VectorRecord } from "../lib/vectorDb.js";

export async function ingestRestaurants() {
  console.log("Starting restaurant ingestion into Vector DB...");

  const existingCount = await vectorDb.count();
  if (existingCount > 0) {
    console.log(
      `Vector DB already has ${existingCount} records. Skipping ingestion.`,
    );
    return;
  }

  const records: VectorRecord[] = [];

  for (const r of restaurants) {
    const textToEmbed = `
      Name: ${r.name}
      Cuisine: ${r.cuisine}
      Price Tier: ${r.price_tier}
      Neighborhood: ${r.neighborhood}
      Tags: ${r.tags?.join(", ") || "None"}
      Description: ${r.description}
    `.trim();

    try {
      const { embedding } = await generateEmbeddingSkill.run({
        text: textToEmbed,
      });
      records.push({
        id: r.id || r.name.toLowerCase().replace(/\s+/g, "-"),
        embedding,
        metadata: r,
      });
      console.log(`Embedded: ${r.name}`);
    } catch (e) {
      console.error(`Failed to embed ${r.name}`, e);
    }
  }

  await vectorDb.upsert(records);
  console.log(
    `Ingestion complete. Total records in Vector DB: ${await vectorDb.count()}`,
  );
}
