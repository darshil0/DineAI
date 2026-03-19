import { AgentSkill } from "./types.js";
import { getGeminiClient } from "../lib/geminiClient.js";

export interface GenerateEmbeddingInput {
  text: string;
}

export interface GenerateEmbeddingOutput {
  embedding: number[];
}

export const generateEmbeddingSkill: AgentSkill<GenerateEmbeddingInput, GenerateEmbeddingOutput> = {
  name: "generateEmbedding",
  description: "Generates a vector embedding for a given text string using Gemini.",
  async run({ text }) {
    const ai = getGeminiClient();
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    
    if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
      throw new Error("Failed to generate embedding");
    }
    
    return { embedding: response.embeddings[0].values };
  },
};
