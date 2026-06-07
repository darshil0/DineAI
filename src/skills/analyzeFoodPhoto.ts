import { AgentSkill } from './types.js';
import { getGeminiClient } from '../lib/geminiClient.js';
import { cleanJson, withRetry } from '../lib/utils.js';
import { Type } from '@google/genai';
import { SkillError } from '../lib/errors.js';

export const analyzeFoodPhotoSkill = {
  name: 'analyzeFoodPhoto',
  description: 'Analyzes a food photo to infer cuisines, ambiance/vibe, and a brief description.',
  async run({ mimeType, data }) {
    const ai = getGeminiClient();
    const prompt = `Analyze this food photo.
Extract the most likely cuisines it represents, the ambiance or vibe it suggests (e.g., casual, fine-dining, cozy), and provide a brief 1-sentence description of the dish.`;

    const result = await withRetry(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ inlineData: { mimeType, data } }, { text: prompt }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cuisines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Inferred cuisines from the photo',
            },
            ambiance: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Inferred ambiance or vibe from the photo',
            },
            description: {
              type: Type.STRING,
              description: 'A brief 1-sentence description of the food',
            },
          },
        },
      },
    }));

    try {
      const output = JSON.parse(
        cleanJson(result.text || '{"cuisines":[],"ambiance":[],"description":""}'),
      );
      return output;
    } catch (e) {
      throw new SkillError('analyzeFoodPhoto', e);
    }
  },
};
