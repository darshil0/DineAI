import { getGeminiClient } from "../lib/geminiClient.js";
import { cleanJson } from "../lib/utils.js";
import { UserTasteProfile, Recommendation, FinalRecommendationsSchema } from "../schemas/index.js";
import { Restaurant } from "../data/restaurants.js";
import { FINALIZER_SYSTEM, buildFinalizerPrompt } from "../prompts/index.js";
import { AgentServiceError } from "../lib/errors.js";

export async function finalizeRecommendations(
  profile: UserTasteProfile,
  message: string,
  candidates: Restaurant[],
  trendReport: string,
  history: string
): Promise<Recommendation[]> {
  const ai = getGeminiClient();
  console.log("Running Recommendation Finalizer Agent...");
  
  try {
    const finalizerResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: buildFinalizerPrompt(JSON.stringify(profile), message, JSON.stringify(candidates), trendReport, history),
      config: {
        responseMimeType: "application/json",
        responseSchema: FinalRecommendationsSchema,
        systemInstruction: FINALIZER_SYSTEM,
      },
    });

    const finalData = JSON.parse(cleanJson(finalizerResponse.text || "{}"));
    const finalRecommendations = finalData.recommendations || [];
    console.log(`Generated ${finalRecommendations.length} final recommendations.`);
    return finalRecommendations;
  } catch (error: any) {
    throw new AgentServiceError("Recommendation Finalizer", error);
  }
}
