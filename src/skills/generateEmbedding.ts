import { AgentSkill } from './types.js';
import { getGeminiClient } from '../lib/geminiClient.js';
import { withRetry } from '../lib/utils.js';
import { SkillError } from '../lib/errors.js';

export interface GenerateEmbeddingInput {
  text: string;
}

export interface GenerateEmbeddingOutput {
  embedding: number[];
}

export const generateEmbeddingSkill: AgentSkill<GenerateEmbeddingInput, GenerateEmbeddingOutput> = {
  name: 'generateEmbedding',
  description: 'Generates a vector embedding for a given text string using Gemini.',
  async run({ text }) {
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new SkillError('generateEmbedding', new Error('Input text must be a non-empty string'));
    }

    const ai = getGeminiClient();
    const response = await withRetry(() => ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [{ parts: [{ text }] }],
      taskType: 'RETRIEVAL_QUERY',
    } as any)) as any;

    // Fix 2: response uses 'embedding' (singular), not 'embeddings'
    if (
      !response.embedding ||
      !response.embedding.values ||
      response.embedding.values.length === 0
    ) {
      throw new SkillError('generateEmbedding', new Error('Empty embedding received from API'));
    }

    return { embedding: response.embedding.values };
  },
};
