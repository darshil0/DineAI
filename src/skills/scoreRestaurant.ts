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
  rationale: string;
}

export const scoreRestaurantSkill: AgentSkill<ScoreInput, ScoreOutput> = {
  name: 'scoreRestaurant',
  description: 'Computes an overall match score between a user taste profile and a restaurant.',
  async run({ profile, restaurant, similarity }) {
    let score = 0;
    const reasons: string[] = [];
    const hasSimilarity = typeof similarity === 'number';

    // Define weights.
    // If similarity is present, we blend 50% similarity and 50% weighted heuristics.
    // Heuristic weights: Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1 (Sum to 1.0)
    const heuristicWeights = {
      cuisine: 0.4,
      price: 0.3,
      ambiance: 0.2,
      dietary: 0.1,
    };

    let heuristicScore = 0;

    // 1. Cuisine match (0.4)
    if (profile.cuisines?.length) {
      const lowerCuisines = profile.cuisines.map((c) => c.toLowerCase());
      if (lowerCuisines.includes(restaurant.cuisine.toLowerCase())) {
        heuristicScore += heuristicWeights.cuisine;
        reasons.push(`Matches your craving for ${restaurant.cuisine}`);
      }
    }

    // 2. Price match (0.3)
    if (profile.price_range && restaurant.price_tier) {
      const priceMap: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
      const userPrice = priceMap[profile.price_range] || 0;
      const restaurantPrice = priceMap[restaurant.price_tier] || 0;

      if (userPrice > 0 && restaurantPrice > 0) {
        const diff = Math.abs(userPrice - restaurantPrice);
        if (diff === 0) {
          heuristicScore += heuristicWeights.price;
          reasons.push('Fits your preferred price point perfectly');
        } else if (diff === 1) {
          heuristicScore += heuristicWeights.price * 0.5;
          reasons.push('Slightly outside your usual price range but close');
        }
      }
    }

    // 3. Ambiance match (0.2)
    if (profile.ambiance?.length && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map((t) => t.toLowerCase());
      const matchedAmbiance = profile.ambiance.filter((a) => lowerTags.includes(a.toLowerCase()));
      if (matchedAmbiance.length > 0) {
        heuristicScore += heuristicWeights.ambiance;
        reasons.push(`Fits your ${matchedAmbiance[0].toLowerCase()} vibe`);
      }
    }

    // 4. Dietary match (0.1)
    if (
      profile.dietary_notes &&
      profile.dietary_notes.toLowerCase() !== 'none' &&
      restaurant.tags?.length
    ) {
      const lowerTags = restaurant.tags.map((t) => t.toLowerCase());
      const dietaryNote = profile.dietary_notes.toLowerCase().trim();
      const hasMatch = lowerTags.some((tag) => tag.includes(dietaryNote) || dietaryNote.includes(tag));
      
      if (hasMatch) {
        heuristicScore += heuristicWeights.dietary;
        reasons.push(`Accommodates your ${dietaryNote} needs`);
      }
    }

    // 5. Neighborhood prioritization (bonus, doesn't add to sum 1.0 but boosts)
    if (profile.neighborhoods?.length && restaurant.neighborhood) {
      const lowerNeighborhoods = profile.neighborhoods.map((n) => n.toLowerCase());
      if (lowerNeighborhoods.includes(restaurant.neighborhood.toLowerCase())) {
        heuristicScore += 0.1; // Small boost
        reasons.push(`Conveniently located in ${restaurant.neighborhood}`);
      }
    }

    let matchScore = 0;
    if (hasSimilarity) {
      // 50/50 blend of similarity and heuristic score
      matchScore = (similarity as number) * 0.5 + Math.min(1, heuristicScore) * 0.5;
      if (similarity! > 0.8) reasons.push('Strong semantic match to your preferences');
    } else {
      matchScore = Math.min(1, heuristicScore);
    }
    const rationale = reasons.length > 0 ? reasons.join('. ') + '.' : 'A general match for your profile.';
    return { matchScore, rationale };
  },
};
