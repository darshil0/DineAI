import { AgentSkill } from "./types.js";
import { UserTasteProfile } from "../schemas/index.js";
import { Restaurant } from "../data/restaurants.js";

interface ScoreInput {
  profile: UserTasteProfile;
  restaurant: Restaurant;
  similarity?: number; // from vector DB, normalized to [0, 1] if you have it
}

interface ScoreOutput {
  matchScore: number; // 0.0–1.0
}

export const scoreRestaurantSkill: AgentSkill<ScoreInput, ScoreOutput> = {
  name: "scoreRestaurant",
  description: "Computes an overall match score between a user taste profile and a restaurant.",
  async run({ profile, restaurant, similarity }) {
    let score = 0;

    // 1. Base on vector similarity if provided
    if (typeof similarity === "number") {
      // similarity assumed [0, 1]; weight it heavily
      score += similarity * 0.5;
    }

    // Normalized Weights (sum = 1.0): Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1
    // Neighborhood and Vector Similarity are additional multipliers or adjustments if used differently,
    // but here we keep a simple additive scoring system.

    // 2. Cuisine match (Weight: 0.4)
    if (profile.cuisines?.length) {
      const lowerCuisines = profile.cuisines.map(c => c.toLowerCase());
      if (lowerCuisines.includes(restaurant.cuisine.toLowerCase())) {
        score += 0.4;
      }
    }

    // 3. Price match (Weight: 0.3)
    if (profile.price_range && restaurant.price_tier) {
      const priceMap: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
      const userPrice = priceMap[profile.price_range] || 0;
      const restaurantPrice = priceMap[restaurant.price_tier] || 0;

      if (userPrice > 0 && restaurantPrice > 0) {
        const diff = Math.abs(userPrice - restaurantPrice);
        if (diff === 0) {
          score += 0.3; // Exact match
        } else if (diff === 1) {
          score += 0.15; // Close match
        } else if (diff >= 3) {
          score -= 0.2; // Significant mismatch
        }
      }
    }

    // 4. Ambiance overlap (Weight: 0.2)
    if (profile.ambiance?.length && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map(t => t.toLowerCase());
      const hasAmbianceMatch = profile.ambiance.some((a) => lowerTags.includes(a.toLowerCase()));
      if (hasAmbianceMatch) {
        score += 0.2;
      }
    }

    // 5. Dietary compatibility (Weight: 0.1)
    if (profile.dietary_notes && profile.dietary_notes.toLowerCase() !== "none" && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map(t => t.toLowerCase());
      const dietaryNote = profile.dietary_notes.toLowerCase();
      if (lowerTags.some(tag => tag.includes(dietaryNote) || dietaryNote.includes(tag))) {
        score += 0.1;
      }
    }

    // Extra Boost: Neighborhood match (Significant but outside the base 1.0)
    if (profile.neighborhoods?.length && restaurant.neighborhood) {
      const lowerNeighborhoods = profile.neighborhoods.map(n => n.toLowerCase());
      if (lowerNeighborhoods.includes(restaurant.neighborhood.toLowerCase())) {
        score += 0.2;
      }
    }

    const matchScore = Math.max(0, Math.min(1, score));
    return { matchScore };
  },
};
