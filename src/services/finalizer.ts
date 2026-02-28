import { getGeminiClient, GEMINI_MODEL } from "../lib/geminiClient.js";
import { cleanJson } from "../lib/utils.js";
import { logger } from "../lib/logger.js";
import {
  UserTasteProfile,
  Recommendation,
  FinalRecommendationsSchema,
} from "../schemas/index.js";
import { Restaurant } from "../data/restaurants.js";
import { FINALIZER_SYSTEM, buildFinalizerPrompt } from "../prompts/index.js";

export async function finalizeRecommendations(
  profile: UserTasteProfile,
  message: string,
  candidates: Restaurant[],
  trendReport: string,
): Promise<Recommendation[]> {
  const ai = getGeminiClient();
  logger.info("Finalizer", "Running Recommendation Finalizer Agent...");

  try {
    const finalizerResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          parts: [
            {
              text: buildFinalizerPrompt(
                JSON.stringify(profile),
                message,
                JSON.stringify(candidates),
                trendReport,
              ),
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: FinalRecommendationsSchema,
        systemInstruction: {
          parts: [{ text: FINALIZER_SYSTEM }],
        },
      },
    });

    const finalData = JSON.parse(
      cleanJson(
        finalizerResponse.candidates?.[0]?.content?.parts?.[0]?.text || "{}",
      ),
    );
    const finalRecommendations = finalData.recommendations || [];
    logger.info("Finalizer", `Generated ${finalRecommendations.length} final recommendations.`);
    return finalRecommendations;
  } catch (error: any) {
    logger.error("Finalizer", "Error in Recommendation Finalizer Agent:", error);
    throw new Error(`Recommendation Finalizer failed: ${error.message}`, { cause: error });
  }
}
