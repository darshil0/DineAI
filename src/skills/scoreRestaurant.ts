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

    // Define weights that sum to 1.0
    const weights = {
      similarity: hasSimilarity ? 0.5 : 0,
      cuisine: hasSimilarity ? 0.3 : 0.4,
      price: hasSimilarity ? 0.2 : 0.3,
      ambiance: 0.15,
      neighborhood: 0.15,
      dietary: 0.1,
    };

    // 1. Base on vector similarity if provided
    if (hasSimilarity) {
      score += (similarity as number) * weights.similarity;
      if (similarity! > 0.7) reasons.push('Strong semantic match to your preferences');
    }

    // 2. Cuisine match
    if (profile.cuisines?.length) {
      const lowerCuisines = profile.cuisines.map((c) => c.toLowerCase());
      if (lowerCuisines.includes(restaurant.cuisine.toLowerCase())) {
        score += weights.cuisine;
        reasons.push(`Matches your craving for ${restaurant.cuisine}`);
      }
    }

    // 3. Price match
    if (profile.price_range && restaurant.price_tier) {
      const priceMap: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
      const userPrice = priceMap[profile.price_range] || 0;
      const restaurantPrice = priceMap[restaurant.price_tier] || 0;

      if (userPrice > 0 && restaurantPrice > 0) {
        const diff = Math.abs(userPrice - restaurantPrice);
        if (diff === 0) {
          score += weights.price;
          reasons.push('Fits your preferred price point perfectly');
        } else if (diff === 1) {
          score += weights.price / 2;
          reasons.push('Slightly outside your usual price range but close');
        } else if (diff >= 3) {
          score -= 0.1; // Reduced penalty
          reasons.push('Significantly different from your budget');
        }
      }
    }

    // 4. Ambiance overlap (proportional to matches)
    if (profile.ambiance?.length && restaurant.tags?.length) {
      const lowerTags = restaurant.tags.map((t) => t.toLowerCase());
      const matchedAmbiance = profile.ambiance.filter((a) => lowerTags.includes(a.toLowerCase()));
      if (matchedAmbiance.length > 0) {
        // Cap at full weight even if multiple matches
        score += Math.min(weights.ambiance, weights.ambiance * (matchedAmbiance.length / profile.ambiance.length));
        reasons.push(`Fits your ${matchedAmbiance[0].toLowerCase()} vibe`);
      }
    }

    // 5. Neighborhood match
    if (profile.neighborhoods?.length && restaurant.neighborhood) {
      const lowerNeighborhoods = profile.neighborhoods.map((n) => n.toLowerCase());
      if (lowerNeighborhoods.includes(restaurant.neighborhood.toLowerCase())) {
        score += weights.neighborhood;
        reasons.push(`Conveniently located in ${restaurant.neighborhood}`);
      }
    }

    // 6. Dietary compatibility (improved matching logic)
    if (
      profile.dietary_notes &&
      profile.dietary_notes.toLowerCase() !== 'none' &&
      restaurant.tags?.length
    ) {
      const lowerTags = restaurant.tags.map((t) => t.toLowerCase());
      const dietaryNote = profile.dietary_notes.toLowerCase().trim();
      
      // Check for exact word matches or inclusive matches
      const hasMatch = lowerTags.some((tag) => {
        const tagWords = tag.split(/[\s-]+/);
        return tagWords.some((word) => word.includes(dietaryNote)) || dietaryNote.includes(tag);
      });
      
      if (hasMatch) {
        score += weights.dietary;
        reasons.push(`Accommodates your ${dietaryNote} needs`);
      }
    }

    // Clamp score to [0, 1]
    const matchScore = Math.max(0, Math.min(1, score));
    const rationale = reasons.length > 0 ? reasons.join('. ') + '.' : 'A general match for your profile.';
    return { matchScore, rationale };
  },
};
