import dotenv from "dotenv";
import { bootstrapSkills } from "./skills/bootstrap.js";
import { listSkills, getSkill } from "./skills/registry.js";
import { logger } from "./lib/logger.js";
import { vectorDb } from "./lib/vectorDb.js";
import { GenerateEmbeddingInput, GenerateEmbeddingOutput } from "./skills/generateEmbedding.js";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

/**
 * Basic system verification script.
 * Tests skill registration, vector DB, and API connectivity.
 */
async function verify() {
  logger.info("Verify", "Starting system verification...");

  // 1. Skill Registration
  bootstrapSkills();
  const registered = listSkills();
  logger.info("Verify", `Registered skills: ${registered.join(", ")}`);

  const expectedSkills = ["extractCuisines", "analyzeFoodPhoto", "generateEmbedding", "scoreRestaurant"];
  const missing = expectedSkills.filter(s => !registered.includes(s));

  if (missing.length > 0) {
    logger.error("Verify", `Missing skills: ${missing.join(", ")}`);
  } else {
    logger.info("Verify", "All expected skills are registered.");
  }

  // 2. Vector DB Check
  try {
    const count = await vectorDb.count();
    logger.info("Verify", `Vector DB count: ${count}`);
  } catch (e) {
    logger.error("Verify", "Vector DB check failed:", e);
  }

  // 3. API Connectivity (Embedding Skill)
  const embeddingSkill = getSkill<GenerateEmbeddingInput, GenerateEmbeddingOutput>("generateEmbedding");
  if (embeddingSkill) {
    try {
      logger.info("Verify", "Testing Gemini API connectivity (generateEmbedding)...");
      const result = await embeddingSkill.run({ text: "Test embedding" });
      if (result.embedding && result.embedding.length > 0) {
        logger.info("Verify", "API connectivity successful. Embedding generated.");
      } else {
        logger.error("Verify", "API returned empty embedding.");
      }
    } catch (e: any) {
      logger.error("Verify", `API connectivity failed: ${e.message}`);
      if (e.message.includes("API_KEY")) {
        logger.error("Verify", "HINT: Please ensure GEMINI_API_KEY is set in .env.local");
      }
    }
  }

  logger.info("Verify", "Verification complete.");
}

verify().catch(e => {
  console.error("Verification script failed:", e);
  process.exit(1);
});
