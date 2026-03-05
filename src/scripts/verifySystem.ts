import dotenv from "dotenv";
import { bootstrapSkills } from "../skills/bootstrap.js";
import { extractCuisinesSkill } from "../skills/extractCuisines.js";
import { generateEmbeddingSkill } from "../skills/generateEmbedding.js";
import { scoreRestaurantSkill } from "../skills/scoreRestaurant.js";
import { analyzeFoodPhotoSkill } from "../skills/analyzeFoodPhoto.js";
import { buildProfile } from "../services/profileBuilder.js";
import { recommendCandidates } from "../services/ragRecommender.js";
import { analyzeTrends } from "../services/trendAnalyst.js";
import { finalizeRecommendations } from "../services/finalizer.js";
import { logger } from "../lib/logger.js";
import { restaurants } from "../data/restaurants.js";
import { ingestRestaurants } from "./ingestRestaurants.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  logger.info("Verification", "Starting system verification...");
  bootstrapSkills();

  // Step 1: Unit Tests for Skills
  await testSkills();

  // Step 2: E2E Chat Flow
  await testE2E();

  logger.info("Verification", "System verification complete!");
}

async function testSkills() {
  logger.info("Verification", "--- Testing Skills ---");

  // 1. extractCuisinesSkill
  logger.info("Verification", "Testing extractCuisinesSkill...");
  const cuisinesResult = await extractCuisinesSkill.run({
    text: "I love Italian and Japanese food",
  });
  logger.info("Verification", `extractCuisines result: ${JSON.stringify(cuisinesResult)}`);
  if (!cuisinesResult.cuisines.includes("Italian") && !cuisinesResult.cuisines.includes("Japanese")) {
    throw new Error("extractCuisinesSkill failed to identify cuisines");
  }

  // 2. generateEmbeddingSkill
  logger.info("Verification", "Testing generateEmbeddingSkill...");
  const embeddingResult = await generateEmbeddingSkill.run({
    text: "test string",
  });
  logger.info("Verification", `generateEmbedding result: Got embedding with ${embeddingResult.embedding.length} values`);
  if (embeddingResult.embedding.length === 0) {
    throw new Error("generateEmbeddingSkill returned empty embedding");
  }

  // 3. scoreRestaurantSkill
  logger.info("Verification", "Testing scoreRestaurantSkill...");
  const sampleProfile = { cuisines: ["Italian"], price_range: "$$$" };
  const sampleRestaurant = restaurants.find((r) => r.name === "L'Artusi") || restaurants[0];
  const scoreResult = await scoreRestaurantSkill.run({
    profile: sampleProfile,
    restaurant: sampleRestaurant,
    similarity: 0.9,
  });
  logger.info("Verification", `scoreRestaurant result: ${JSON.stringify(scoreResult)}`);
  if (scoreResult.matchScore < 0.5) {
    throw new Error("scoreRestaurantSkill gave unexpectedly low score for high-match restaurant");
  }

  // 4. analyzeFoodPhotoSkill
  logger.info("Verification", "Testing analyzeFoodPhotoSkill...");
  // 1x1 GIF
  const base64Image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const photoResult = await analyzeFoodPhotoSkill.run({
    mimeType: "image/gif",
    data: base64Image,
  });
  logger.info("Verification", `analyzeFoodPhoto result: ${JSON.stringify(photoResult)}`);
  if (!photoResult.cuisines || !photoResult.ambiance || !photoResult.description) {
    throw new Error("analyzeFoodPhotoSkill returned incomplete data");
  }
}

async function testE2E() {
  logger.info("Verification", "--- Testing E2E Chat Flow ---");

  // 1. Ingest Restaurants
  logger.info("Verification", "Ingesting restaurants for E2E test...");
  await ingestRestaurants();

  const message = "Recommend a romantic Italian place in the West Village";

  // 2. buildProfile
  logger.info("Verification", "Step 1: buildProfile...");
  const profile = await buildProfile(message, "[]", "{}");
  logger.info("Verification", `Profile generated: ${JSON.stringify(profile)}`);

  if (!profile.cuisines?.some(c => c.toLowerCase().includes("italian"))) {
    throw new Error("E2E: buildProfile failed to identify Italian cuisine");
  }

  // 3. recommendCandidates
  logger.info("Verification", "Step 2: recommendCandidates...");
  const candidates = await recommendCandidates(profile);
  logger.info("Verification", `Candidates found: ${candidates.length}`);
  if (candidates.length === 0) {
    throw new Error("E2E: recommendCandidates returned no results");
  }

  // 4. analyzeTrends
  logger.info("Verification", "Step 3: analyzeTrends...");
  const trends = await analyzeTrends(profile);
  logger.info("Verification", `Trends analyzed: ${trends.substring(0, 100)}...`);
  if (!trends) {
    throw new Error("E2E: analyzeTrends returned empty report");
  }

  // 5. finalizeRecommendations
  logger.info("Verification", "Step 4: finalizeRecommendations...");
  const recommendations = await finalizeRecommendations(profile, message, candidates, trends);
  logger.info("Verification", `Final recommendations: ${recommendations.length}`);
  if (recommendations.length === 0) {
    throw new Error("E2E: finalizeRecommendations returned no results");
  }

  recommendations.forEach((rec, i) => {
    logger.info("Verification", `Rec ${i+1}: ${rec.name} (Score: ${rec.match_score}) - Rationale: ${rec.rationale.substring(0, 50)}...`);
  });
}

main().catch((err) => {
  logger.error("Verification", "Verification failed:", err);
  process.exit(1);
});
