import { registerSkill } from "./registry.js";
import { extractCuisinesSkill } from "./extractCuisines.js";
import { analyzeFoodPhotoSkill } from "./analyzeFoodPhoto.js";
import { generateEmbeddingSkill } from "./generateEmbedding.js";
import { scoreRestaurantSkill } from "./scoreRestaurant.js";

import { extractTrendsFromSearchResultsSkill } from "./extractTrendsFromSearchResults.js";
import { classifyTrendRelevanceToProfileSkill } from "./classifyTrendRelevanceToProfile.js";

export function bootstrapSkills() {
  registerSkill(extractCuisinesSkill);
  registerSkill(analyzeFoodPhotoSkill);
  registerSkill(generateEmbeddingSkill);
  registerSkill(scoreRestaurantSkill);
  registerSkill(extractTrendsFromSearchResultsSkill);
  registerSkill(classifyTrendRelevanceToProfileSkill);
  console.log("Agent Skills registered successfully.");
}
