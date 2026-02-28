import { getGeminiClient } from "../lib/geminiClient.js";
import { cleanJson } from "../lib/utils.js";
import { UserTasteProfile } from "../schemas/index.js";
import { restaurants, Restaurant } from "../data/restaurants.js";
import { RAG_RECOMMENDER_SYSTEM, buildRagPrompt } from "../prompts/index.js";
import { getSkill } from "../skills/registry.js";
import { GenerateEmbeddingInput, GenerateEmbeddingOutput } from "../skills/generateEmbedding.js";
import { vectorDb } from "../lib/vectorDb.js";

export async function recommendCandidates(profile: UserTasteProfile): Promise<Restaurant[]> {
  console.log("Running RAG Recommender Agent...");
  
  try {
    // 1. Try Vector DB approach first
    const generateEmbedding = getSkill<GenerateEmbeddingInput, GenerateEmbeddingOutput>("generateEmbedding");
    const scoreRestaurant = getSkill<{ profile: UserTasteProfile; restaurant: Restaurant; similarity?: number }, { matchScore: number }>("scoreRestaurant");
    
    if (generateEmbedding && scoreRestaurant && await vectorDb.count() > 0) {
      console.log("Using Vector DB for semantic search...");
      
      const queryText = `
        User wants:
        Cuisines: ${profile.cuisines?.join(", ") || "Any"}
        Price Range: ${profile.price_range || "Any"}
        Ambiance: ${profile.ambiance?.join(", ") || "Any"}
        Dietary Notes: ${profile.dietary_notes || "None"}
        Special Occasions: ${profile.special_occasions?.join(", ") || "None"}
      `.trim();
      
      const { embedding } = await generateEmbedding.run({ text: queryText });
      const results = await vectorDb.query(embedding, 20); // Get top 20 to re-rank
      
      const scored = await Promise.all(
        results.map(async (r) => {
          const restaurant = r.metadata as Restaurant;
          const { matchScore } = await scoreRestaurant.run({
            profile,
            restaurant,
            similarity: r.score
          });
          return { ...restaurant, match_score: matchScore, embedding_score: r.score };
        })
      );
      
      // Sort by the refined matchScore
      const sorted = scored.sort((a, b) => b.match_score - a.match_score);
      const candidates = sorted.slice(0, 10);
      
      console.log(`Found ${candidates.length} candidates via Vector DB and scoreRestaurant skill.`);
      return candidates;
    }
  } catch (error) {
    console.warn("Vector DB search failed, falling back to static filtering...", error);
  }

  // 2. Fallback to static JSON filtering via LLM
  console.log("Using fallback LLM filtering...");
  const ai = getGeminiClient();
  try {
    const ragResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: buildRagPrompt(JSON.stringify(profile), JSON.stringify(restaurants)),
      config: {
        responseMimeType: "application/json",
        systemInstruction: RAG_RECOMMENDER_SYSTEM,
      },
    });

    const candidateList = JSON.parse(cleanJson(ragResponse.text || "[]"));
    console.log(`Found ${candidateList.length} candidates via fallback.`);
    return candidateList;
  } catch (error: any) {
    console.error("Error in Coarse RAG Recommender Agent:", error);
    throw new Error(`RAG Recommender failed: ${error.message}`);
  }
}
