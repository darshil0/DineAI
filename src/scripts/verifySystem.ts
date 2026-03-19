import dotenv from "dotenv";
import { bootstrapSkills } from "../skills/bootstrap.js";
import { getSkill } from "../skills/registry.js";
import { ExtractCuisinesInput, ExtractCuisinesOutput } from "../skills/extractCuisines.js";
import { AnalyzeFoodPhotoInput, AnalyzeFoodPhotoOutput } from "../skills/analyzeFoodPhoto.js";
import { GenerateEmbeddingInput, GenerateEmbeddingOutput } from "../skills/generateEmbedding.js";
import { restaurants, Restaurant } from "../data/restaurants.js";
import { UserTasteProfile } from "../schemas/index.js";
import { recommendCandidates } from "../services/ragRecommender.js";
import { ingestRestaurants } from "./ingestRestaurants.js";

dotenv.config();

async function runVerification() {
  console.log("Starting System Verification...\n");

  try {
    // 1. Bootstrap Skills
    bootstrapSkills();

    // 2. Test extractCuisines skill
    console.log("Testing extractCuisines skill...");
    const extractCuisines = getSkill<ExtractCuisinesInput, ExtractCuisinesOutput>("extractCuisines");
    if (!extractCuisines) throw new Error("extractCuisines skill not registered");
    const cuisinesResult = await extractCuisines.run({ text: "I love Italian pasta and spicy Mexican food." });
    console.log("Cuisines:", cuisinesResult.cuisines);
    if (!cuisinesResult.cuisines.includes("Italian") && !cuisinesResult.cuisines.some(c => c.toLowerCase().includes("italian"))) {
        console.warn("Warning: Italian not found in cuisines output.");
    }

    // 3. Test generateEmbedding skill
    console.log("\nTesting generateEmbedding skill...");
    const generateEmbedding = getSkill<GenerateEmbeddingInput, GenerateEmbeddingOutput>("generateEmbedding");
    if (!generateEmbedding) throw new Error("generateEmbedding skill not registered");
    const embeddingResult = await generateEmbedding.run({ text: "Checking if embedding works." });
    console.log("Embedding length:", embeddingResult.embedding.length);
    if (embeddingResult.embedding.length === 0) throw new Error("Empty embedding generated");

    // 4. Test scoreRestaurant skill
    console.log("\nTesting scoreRestaurant skill...");
    const scoreRestaurant = getSkill<{ profile: UserTasteProfile; restaurant: Restaurant; similarity?: number }, { matchScore: number }>("scoreRestaurant");
    if (!scoreRestaurant) throw new Error("scoreRestaurant skill not registered");
    const testProfile: UserTasteProfile = { cuisines: ["Italian"], price_range: "$$$", neighborhoods: ["West Village"] };
    const testRestaurant = restaurants[0]; // L'Artusi (Italian, $$$, West Village)
    const scoreResult = await scoreRestaurant.run({ profile: testProfile, restaurant: testRestaurant });
    console.log(`Score for ${testRestaurant.name}:`, scoreResult.matchScore);
    if (scoreResult.matchScore < 0.5) console.warn("Warning: Lower than expected score for a good match.");

    // 5. Test RAG Recommender and Vector DB Ingestion
    console.log("\nTesting RAG Recommender and Vector DB...");
    await ingestRestaurants();
    const candidates = await recommendCandidates(testProfile);
    console.log(`Found ${candidates.length} candidates.`);
    if (candidates.length === 0) console.warn("Warning: No candidates returned by RAG Recommender.");

    console.log("\nSystem Verification Complete: Success!");
  } catch (error: any) {
    console.error("\nSystem Verification Failed:", error.message);
    process.exit(1);
  }
}

runVerification();
