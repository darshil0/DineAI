import { getGeminiClient } from '../lib/geminiClient.js';
import { UserTasteProfile, Recommendation, FinalRecommendationsSchema } from '../schemas/index.js';
import { FINALIZER_SYSTEM, buildFinalizerPrompt } from '../prompts/index.js';
import { AgentServiceError } from '../lib/errors.js';
import { withRetry, cleanJson } from '../lib/utils.js';
import { RestaurantCandidate } from './ragRecommender.js';

export async function finalizeRecommendations(
  profile: UserTasteProfile,
  message: string,
  candidates: RestaurantCandidate[],
  trendReport: string,
  history: string,
): Promise<Recommendation[]> {
  const ai = getGeminiClient();
  console.log('Running Recommendation Finalizer Agent...');

  try {
    const finalizerResponse = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-pro-preview-05-06',
        contents: buildFinalizerPrompt(
          JSON.stringify(profile),
          message,
          JSON.stringify(candidates),
          trendReport,
          history,
        ),
        config: {
          responseMimeType: 'application/json',
          responseSchema: FinalRecommendationsSchema,
          systemInstruction: FINALIZER_SYSTEM,
        },
      }),
    );

    let finalRecommendations: Recommendation[] = [];
    try {
      const finalData = JSON.parse(cleanJson(finalizerResponse.text || '{"recommendations":[]}'));
      finalRecommendations = finalData.recommendations || [];
    } catch (parseError) {
      console.error('Failed to parse Finalizer response as JSON:', parseError);
      console.error('Raw response text:', finalizerResponse.text);
      // Return empty array rather than crashing — graceful degradation
      return [];
    }

    console.log(`Generated ${finalRecommendations.length} final recommendations.`);
    return finalRecommendations;
  } catch (error: unknown) {
    throw new AgentServiceError('Recommendation Finalizer', error);
  }
}
