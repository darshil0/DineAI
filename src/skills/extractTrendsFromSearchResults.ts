import { getGeminiClient } from "../lib/geminiClient.js";
import { AgentSkill } from "./types.js";
import { Type } from "@google/genai";
import { cleanJson } from "../lib/utils.js";

interface ExtractTrendsInput {
  searchResults: string;
  city: string;
}

interface TrendInfo {
  trendingCuisines: string[];
  newOpenings: string[];
  viralDishes: string[];
  summary: string;
}

export const extractTrendsFromSearchResultsSkill: AgentSkill<ExtractTrendsInput, TrendInfo> = {
  name: "extractTrendsFromSearchResults",
  description: "Extracts structured food trends, new openings, and viral dishes from raw search results.",
  run: async (input: ExtractTrendsInput) => {
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these search results for food trends in ${input.city}.
      
      Search Results:
      ${input.searchResults}
      
      Extract:
      1. Trending Cuisines: Specific cuisines gaining popularity.
      2. New Openings: Notable restaurants that recently opened.
      3. Viral Dishes: Specific dishes people are talking about.
      4. A brief summary of the overall food scene.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trendingCuisines: { type: Type.ARRAY, items: { type: Type.STRING } },
            newOpenings: { type: Type.ARRAY, items: { type: Type.STRING } },
            viralDishes: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["trendingCuisines", "newOpenings", "viralDishes", "summary"]
        }
      }
    });

    try {
      return JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
      console.error("Failed to parse trends from search results:", e);
      return {
        trendingCuisines: [],
        newOpenings: [],
        viralDishes: [],
        summary: "Could not extract trends from search results."
      };
    }
  }
};
