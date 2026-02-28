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

export const extractCuisinesSkill: AgentSkill<
  ExtractCuisinesInput,
  ExtractCuisinesOutput
> = {
  name: "extractCuisines",
  description: "Extracts cuisine preferences from user text.",
  async run({ text }) {
    const ai = getGeminiClient();
    const prompt = `You are an assistant that extracts cuisines from user text.
Return a JSON array of cuisine names only (strings), no explanation.

User text:
${text}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "List of cuisines explicitly mentioned or strongly implied.",
        },
      },
    });

    const cuisines = JSON.parse(
      cleanJson(result.candidates?.[0]?.content?.parts?.[0]?.text || "[]"),
    );
    return { cuisines };
  },
};
