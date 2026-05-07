import { Type } from '@google/genai';

export interface Recommendation {
  rank: number;
  name: string;
  rationale: string;
  match_score: number;
  trend_relevance: string;
  trend_connection: string;
  address?: string;
  phone?: string;
  hours?: string;
  cuisine?: string;
  price_level?: string;
  neighborhood?: string;
  whyMatch?: string;
}

export const FinalRecommendationsSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rank: { type: Type.INTEGER, description: 'Rank of the recommendation (1 is best)' },
          name: { type: Type.STRING, description: 'Name of the restaurant' },
          rationale: {
            type: Type.STRING,
            description:
              'Detailed explanation of why this restaurant is recommended based on taste profile and current request.',
          },
          match_score: {
            type: Type.NUMBER,
            description:
              "A score from 0.0 to 1.0 indicating how well it matches the user's profile",
          },
          trend_relevance: {
            type: Type.STRING,
            description:
              "Description of the specific trend associated with this restaurant (e.g. 'Viral dish: Spicy Vodka Rigatoni')",
          },
          trend_connection: {
            type: Type.STRING,
            description:
              "A detailed explanation of why this identified trend specifically relates to the user's tastes and dining habits.",
          },
          address: { type: Type.STRING, description: 'Physical address of the restaurant' },
          phone: { type: Type.STRING, description: 'Contact phone number' },
          hours: { type: Type.STRING, description: 'Operating hours' },
          cuisine: { type: Type.STRING, description: 'Primary cuisine type' },
          price_level: { type: Type.STRING, description: 'Price level ($, $$, $$$, $$$$)' },
          neighborhood: { type: Type.STRING, description: 'Neighborhood location' },
          whyMatch: { type: Type.STRING, description: 'Underlying heuristic match rationale' },
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
