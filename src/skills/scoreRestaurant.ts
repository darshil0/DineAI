import { AgentSkill } from './types.js';
import { UserTasteProfile } from '../schemas/index.js';
import { Restaurant } from '../data/restaurants.js';

interface ScoreInput {
  profile: UserTasteProfile;
  restaurant: Restaurant;
  similarity?: number; // from vector DB, normalized to [0, 1] if you have it
}

interface ScoreOutput {
  matchScore: number; // 0.0–1.0
}

export const scoreRestaurantSkill: AgentSkill<ScoreInput, ScoreOutput> = {
  name: 'scoreRestaurant',
  description: 'Computes an overall match score between a user taste profile and a restaurant.',
  async run({ profile, restaurant, similarity }) {
    let heuristicScore = 0;

    // 1. Cuisine match (Weight: 0.4)
    if (profile.cuisines?.length) {
      const lowerCuisines = profile.cuisines.map((c) => c.toLowerCase());
      if (lowerCuisines.includes(restaurant.cuisine.toLowerCase())) {
        heuristicScore += 0.4;
      }
    }

    // 2. Price match (Weight: 0.3)
    if (profile.price_range && restaurant.price_tier) {
      const priceMap: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
      const userPrice = priceMap[profile.price_range] || 0;
      const restaurantPrice = priceMap[restaurant.price_tier] || 0;

      if (userPrice > 0 && restaurantPrice > 0) {
        const diff = Math.abs(userPrice - restaurantPrice);
        if (diff === 0) {
          heuristicScore += 0.3; // Exact match
        } else if (diff === 1) {
          heuristicScore += 0.15; // Close match (one tier away)
        } else if (diff >= 3) {
          heuristicScore -= 0.2; // Significant mismatch
        }
      }
    }

    // 3. Ambiance overlap (Weight: 0.2)
    if (profile.ambiance?.length && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map((t) => t.toLowerCase());
      const hasAmbianceMatch = profile.ambiance.some((a) => lowerTags.includes(a.toLowerCase()));
      if (hasAmbianceMatch) {
        heuristicScore += 0.2;
      }
    }

    // 4. Dietary compatibility (Weight: 0.1)
    if (
      profile.dietary_notes &&
      profile.dietary_notes.toLowerCase() !== 'none' &&
      restaurant.tags?.length
    ) {
      const lowerTags = restaurant.tags.map((t) => t.toLowerCase());
      const dietaryNote = profile.dietary_notes.toLowerCase();
      if (lowerTags.some((tag) => tag.includes(dietaryNote) || dietaryNote.includes(tag))) {
        heuristicScore += 0.1;
      }
    }

    let finalScore: number;
    if (typeof similarity === 'number') {
      // 50% vector similarity, 50% heuristics
      finalScore = similarity * 0.5 + heuristicScore * 0.5;
    } else {
      finalScore = heuristicScore;
    }

    const matchScore = Math.max(0, Math.min(1, finalScore));
    return { matchScore };
  },
};
