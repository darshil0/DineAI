import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export const GEMINI_MODEL = "gemini-2.0-flash";

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}
