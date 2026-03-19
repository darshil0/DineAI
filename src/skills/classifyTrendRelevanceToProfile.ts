import { getGeminiClient } from "../lib/geminiClient.js";
import { AgentSkill } from "./types.js";
import { Type } from "@google/genai";
import { UserTasteProfile } from "../schemas/userTasteProfile.js";
import { cleanJson } from "../lib/utils.js";

interface ClassifyTrendInput {
  profile: UserTasteProfile;
  trends: {
    trendingCuisines: string[];
    newOpenings: string[];
    viralDishes: string[];
  };
}

interface TrendRelevance {
  relevantCuisines: string[];
  relevantOpenings: string[];
  relevantDishes: string[];
  overallRelevanceScore: number; // 0.0-1.0
  rationale: string;
}

export const classifyTrendRelevanceToProfileSkill: AgentSkill<ClassifyTrendInput, TrendRelevance> = {
  name: "classifyTrendRelevanceToProfile",
  description: "Determines which food trends are most relevant to a user's specific taste profile.",
  run: async (input: ClassifyTrendInput) => {
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Compare the user's taste profile with these food trends.
      
      User Taste Profile:
      ${JSON.stringify(input.profile, null, 2)}
      
      Food Trends:
      ${JSON.stringify(input.trends, null, 2)}
      
      Identify which trends the user would likely be interested in based on their preferred cuisines, price range, ambiance, and dietary notes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevantCuisines: { type: Type.ARRAY, items: { type: Type.STRING } },
            relevantOpenings: { type: Type.ARRAY, items: { type: Type.STRING } },
            relevantDishes: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallRelevanceScore: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          },
          required: ["relevantCuisines", "relevantOpenings", "relevantDishes", "overallRelevanceScore", "rationale"]
        }
      }
    });

    const data = JSON.parse(cleanJson(response.text || "{}"));
    return {
      relevantCuisines: data.relevantCuisines || [],
      relevantOpenings: data.relevantOpenings || [],
      relevantDishes: data.relevantDishes || [],
      overallRelevanceScore: data.overallRelevanceScore || 0,
      rationale: data.rationale || "No specific relevance found."
    };
  }
};
