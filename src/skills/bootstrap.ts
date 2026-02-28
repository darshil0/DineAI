import { registerSkill } from "./registry.js";
import { extractCuisinesSkill } from "./extractCuisines.js";
import { analyzeFoodPhotoSkill } from "./analyzeFoodPhoto.js";
import { generateEmbeddingSkill } from "./generateEmbedding.js";
import { scoreRestaurantSkill } from "./scoreRestaurant.js";

export function bootstrapSkills() {
  registerSkill(extractCuisinesSkill);
  registerSkill(analyzeFoodPhotoSkill);
  registerSkill(generateEmbeddingSkill);
  registerSkill(scoreRestaurantSkill);
  console.log("Agent Skills registered successfully.");
}
