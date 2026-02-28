import { Type } from "@google/genai";

export interface Recommendation {
  rank: number;
  name: string;
  rationale: string;
  match_score: number;
  trend_relevance: string;
}

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
            description: "Rank of the recommendation (1 is best)",
          },
          name: { type: Type.STRING, description: "Name of the restaurant" },
          rationale: {
            type: Type.STRING,
            description:
              "Detailed explanation of why this restaurant is recommended based on taste profile and trends",
          },
          match_score: {
            type: Type.NUMBER,
            description:
              "A score from 0.0 to 1.0 indicating how well it matches the user's profile",
          },
          trend_relevance: {
            type: Type.STRING,
            description: "How this restaurant relates to current food trends",
          },
        },
        required: [
          "rank",
          "name",
          "rationale",
          "match_score",
          "trend_relevance",
        ],
      },
    },
  },
  required: ["recommendations"],
};
