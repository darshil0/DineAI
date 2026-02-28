import { AgentSkill } from "./types.js";
import { getGeminiClient } from "../lib/geminiClient.js";
import { cleanJson } from "../lib/utils.js";
import { Type } from "@google/genai";

export interface AnalyzeFoodPhotoInput {
  mimeType: string;
  data: string; // Base64 encoded image data
}

export interface AnalyzeFoodPhotoOutput {
  cuisines: string[];
  ambiance: string[];
  description: string;
}

export const analyzeFoodPhotoSkill: AgentSkill<
  AnalyzeFoodPhotoInput,
  AnalyzeFoodPhotoOutput
> = {
  name: "analyzeFoodPhoto",
  description:
    "Analyzes a food photo to infer cuisines, ambiance/vibe, and a brief description.",
  async run({ mimeType, data }) {
    const ai = getGeminiClient();
    const prompt = `Analyze this food photo.
Extract the most likely cuisines it represents, the ambiance or vibe it suggests (e.g., casual, fine-dining, cozy), and provide a brief 1-sentence description of the dish.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [{ inlineData: { mimeType, data } }, { text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cuisines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Inferred cuisines from the photo",
            },
            ambiance: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Inferred ambiance or vibe from the photo",
            },
            description: {
              type: Type.STRING,
              description: "A brief 1-sentence description of the food",
            },
          },
        },
      },
    });

    const output = JSON.parse(
      cleanJson(
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
          '{"cuisines":[],"ambiance":[],"description":""}',
      ),
    );
    return output;
  },
};
