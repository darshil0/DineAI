import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function verifyGeminiHealth(): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Health Check Failed] GEMINI_API_KEY environment variable is not configured.');
    return false;
  }

  try {
    const ai = getGeminiClient();
    // Perform a minimal, zero-latency/low-cost check
    if (!ai) return false;
    return true;
  } catch (error: any) {
    console.error('[Health Check Failed] Gemini client initialization error:', error.message);
    return false;
  }
}
