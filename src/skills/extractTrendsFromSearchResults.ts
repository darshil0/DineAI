import { GoogleGenAI, Type } from "@google/genai";
import { AgentSkill } from "./types.js";

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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
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

    return JSON.parse(response.text);
  }
};
