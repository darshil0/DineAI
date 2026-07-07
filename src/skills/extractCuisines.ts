import { AgentSkill } from './types.js';
import { getGeminiClient } from '../lib/geminiClient.js';
import { cleanJson, withRetry } from '../lib/utils.js';
import { Type } from '@google/genai';
import { SkillError } from '../lib/errors.js';

export interface ExtractCuisinesInput {
  text: string;
}

export interface ExtractCuisinesOutput {
  cuisines: string[];
}

export const extractCuisinesSkill: AgentSkill<ExtractCuisinesInput, ExtractCuisinesOutput> = {
  name: 'extractCuisines',
  description: 'Extracts cuisine preferences from user text.',
  async run({ text }) {
    const ai = getGeminiClient();
    const prompt = `You are an assistant that extracts cuisines from user text.
Return a JSON array of cuisine names only (strings), no explanation.

User text:
${text}`;

    const result = await withRetry(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cuisines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of cuisines explicitly mentioned or strongly implied.',
            },
          },
          required: ['cuisines'],
        },
      },
    })) as any;

    try {
      const data = JSON.parse(cleanJson(result.text || '{"cuisines":[]}'));
      return { cuisines: data.cuisines || [] };
    } catch (e) {
      throw new SkillError('extractCuisines', e);
    }
  },
};
