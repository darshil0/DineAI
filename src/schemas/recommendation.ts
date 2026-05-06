import { Type as SchemaType } from '@google/genai';

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
}

export const FinalRecommendationsSchema = {
  type: SchemaType.OBJECT,
  properties: {
    recommendations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          rank: {
            type: SchemaType.INTEGER,
            description: 'Rank of the recommendation (1 is best)',
          },
          name: { type: SchemaType.STRING, description: 'Name of the restaurant' },
          rationale: {
            type: SchemaType.STRING,
            description:
              'Detailed explanation of why this restaurant is recommended based on taste profile and current request.',
          },
          match_score: {
            type: SchemaType.NUMBER,
            description:
              "A score from 0.0 to 1.0 indicating how well it matches the user's profile",
          },
          trend_relevance: {
            type: SchemaType.STRING,
            description:
              "Description of the specific trend associated with this restaurant (e.g. 'Viral dish: Spicy Vodka Rigatoni')",
          },
          trend_connection: {
            type: SchemaType.STRING,
            description:
              "A detailed explanation of why this identified trend specifically relates to the user's tastes and dining habits.",
          },
          address: { type: SchemaType.STRING, description: 'Physical address of the restaurant' },
          phone: { type: SchemaType.STRING, description: 'Contact phone number' },
          hours: { type: SchemaType.STRING, description: 'Operating hours' },
          cuisine: { type: SchemaType.STRING, description: 'Primary cuisine type' },
          price_level: { type: SchemaType.STRING, description: 'Price level ($, $$, $$$, $$$$)' },
          neighborhood: { type: SchemaType.STRING, description: 'Neighborhood location' },
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
