import { AgentSkill } from "./types.js";
import { getGeminiClient } from "../lib/geminiClient.js";
import { cleanJson } from "../lib/utils.js";
import { Type } from "@google/genai";

export interface ExtractCuisinesInput {
  text: string;
}

export interface ExtractCuisinesOutput {
  cuisines: string[];
}

export const extractCuisinesSkill: AgentSkill<ExtractCuisinesInput, ExtractCuisinesOutput> = {
  name: "extractCuisines",
  description: "Extracts cuisine preferences from user text.",
  async run({ text }) {
    const ai = getGeminiClient();
    const prompt = `You are an assistant that extracts cuisines from user text.
Return a JSON object with a "cuisines" array of cuisine name strings only, no explanation.

User text:
${text}`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // FIX: Gemini requires the root responseSchema to be Type.OBJECT.
        // A top-level Type.ARRAY is not supported and causes an API error.
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cuisines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of cuisines explicitly mentioned or strongly implied."
            }
          },
          required: ["cuisines"]
        }
      }
    });

    const parsed = JSON.parse(cleanJson(result.text || '{"cuisines":[]}'));
    return { cuisines: parsed.cuisines ?? [] };
  },
};
