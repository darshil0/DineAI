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

    // 2. Cuisine match
    if (profile.cuisines?.length) {
      const lowerCuisines = profile.cuisines.map(c => c.toLowerCase());
      if (lowerCuisines.includes(restaurant.cuisine.toLowerCase())) {
        score += 0.2;
      }
    }

    // 3. Price match
    if (profile.price_range && restaurant.price_tier) {
      if (profile.price_range === restaurant.price_tier) {
        score += 0.15;
      }
    }

    // 4. Ambiance overlap (using restaurant tags)
    if (profile.ambiance?.length && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map(t => t.toLowerCase());
      const hasAmbianceMatch = profile.ambiance.some((a) => lowerTags.includes(a.toLowerCase()));
      if (hasAmbianceMatch) {
        score += 0.1;
      }
    }

    // 5. Dietary compatibility (using restaurant tags)
    if (profile.dietary_notes && profile.dietary_notes.toLowerCase() !== "none" && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map(t => t.toLowerCase());
      const dietaryNote = profile.dietary_notes.toLowerCase();
      // Simple check if the dietary note is mentioned in the tags
      if (lowerTags.some(tag => tag.includes(dietaryNote) || dietaryNote.includes(tag))) {
        score += 0.05;
      }
    }

    const matchScore = Math.max(0, Math.min(1, score));
    return { matchScore };
  },
};
