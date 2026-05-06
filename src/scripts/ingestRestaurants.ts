import { getSkill } from '../skills/registry.js';
import { GenerateEmbeddingInput, GenerateEmbeddingOutput } from '../skills/generateEmbedding.js';
import { vectorDb } from '../lib/vectorDb.js';
import { restaurants } from '../data/restaurants.js';
import { withRetry } from '../lib/utils.js';
import { AgentServiceError } from '../lib/errors.js';

export async function ingestRestaurants() {
  console.log('Checking Vector DB status...');

  const count = await vectorDb.count();
  if (count > 0) {
    console.log(`Vector DB already contains ${count} records. Skipping ingestion.`);
    return;
  }

  console.log('Ingesting restaurants into Vector DB...');
  const generateEmbedding = getSkill<GenerateEmbeddingInput, GenerateEmbeddingOutput>(
    'generateEmbedding',
  );

  if (!generateEmbedding) {
    throw new AgentServiceError(
      'Ingestion',
      new Error('generateEmbedding skill not registered. Ingestion failed.'),
    );
  }

  for (const restaurant of restaurants) {
    console.log(`Generating embedding for ${restaurant.name}...`);
    const textToEmbed = `
      Name: ${restaurant.name}
      Cuisine: ${restaurant.cuisine}
      Price: ${restaurant.price_tier}
      Neighborhood: ${restaurant.neighborhood}
      Description: ${restaurant.description}
      Tags: ${restaurant.tags.join(', ')}
    `.trim();

    try {
      const { embedding } = await withRetry(() => generateEmbedding.run({ text: textToEmbed }));
      await vectorDb.upsert([
        {
          id: restaurant.id,
          embedding,
          metadata: restaurant,
        },
      ]);
    } catch (error) {
      console.error(`Failed to ingest ${restaurant.name}:`, error);
      // Continue with others
    }
  }

  console.log('Ingestion complete.');
  vectorDb.saveToIndex();
}
