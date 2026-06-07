import { Type } from '@google/genai';

/**
 * Represents a single restaurant recommendation with matching rationale
 * and trend-based context.
 */
export interface Recommendation {
  rank: number;                          // Rank of the recommendation (1 is best)
  name: string;                          // Name of the restaurant
  rationale: string;                     // Detailed explanation of why recommended
  match_score: number;                   // 0.0 to 1.0 matching score
  trend_relevance: string;               // Specific trend associated (e.g., 'Viral dish: Spicy Vodka Rigatoni')
  trend_connection: string;              // Why this trend relates to user's tastes
  address?: string;                      // Physical address of the restaurant
  phone?: string;                        // Contact phone number
  hours?: string;                        // Operating hours
  cuisine?: string;                      // Primary cuisine type
  price_level?: string;                  // Price level ($, $$, $$$, $$$$)
  neighborhood?: string;                 // Neighborhood location
  whyMatch?: string;                     // Underlying heuristic match rationale
}

/**
 * JSON schema for structured output from Gemini API
 * for final restaurant recommendations.
 */
export const FinalRecommendationsSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rank: { 
            type: Type.INTEGER, 
            description: 'Rank of the recommendation (1 is best)',
            minimum: 1,
          },
          name: { 
            type: Type.STRING, 
            description: 'Name of the restaurant',
            minLength: 1,
          },
          rationale: {
            type: Type.STRING,
            description:
              'Detailed explanation of why this restaurant is recommended based on taste profile and current request.',
            minLength: 1,
          },
          match_score: {
            type: Type.NUMBER,
            description:
              "A score from 0.0 to 1.0 indicating how well it matches the user's profile",
            minimum: 0,
            maximum: 1,
          },
          trend_relevance: {
            type: Type.STRING,
            description:
              "Description of the specific trend associated with this restaurant (e.g. 'Viral dish: Spicy Vodka Rigatoni')",
            minLength: 1,
          },
          trend_connection: {
            type: Type.STRING,
            description:
              "A detailed explanation of why this identified trend specifically relates to the user's tastes and dining habits.",
            minLength: 1,
          },
          address: { 
            type: Type.STRING, 
            description: 'Physical address of the restaurant',
          },
          phone: { 
            type: Type.STRING, 
            description: 'Contact phone number',
          },
          hours: { 
            type: Type.STRING, 
            description: 'Operating hours',
          },
          cuisine: { 
            type: Type.STRING, 
            description: 'Primary cuisine type',
          },
          price_level: { 
            type: Type.STRING, 
            description: 'Price level ($, $$, $$$, $$$$)',
          },
          neighborhood: { 
            type: Type.STRING, 
            description: 'Neighborhood location',
          },
          whyMatch: { 
            type: Type.STRING, 
            description: 'Underlying heuristic match rationale',
          },
        },
        required: [
          'rank',
          'name',
          'rationale',
          'match_score',
          'trend_relevance',
          'trend_connection',
        ],
      },
    },
  },
  required: ['recommendations'],
};
