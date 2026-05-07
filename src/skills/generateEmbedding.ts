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
    const ai = getGeminiClient();
    const response = await withRetry(() => ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text,
    }));

    if (
      !response.embeddings ||
      response.embeddings.length === 0 ||
      !response.embeddings[0].values
    ) {
      throw new SkillError('generateEmbedding', new Error('Empty embedding received from API'));
    }

    return { embedding: response.embeddings[0].values };
  },
};
