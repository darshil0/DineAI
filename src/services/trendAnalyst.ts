import { getGeminiClient, GEMINI_MODEL } from "../lib/geminiClient.js";
import { logger } from "../lib/logger.js";
import { UserTasteProfile } from "../schemas/index.js";
import { TREND_ANALYST_SYSTEM, buildTrendPrompt } from "../prompts/index.js";

export async function analyzeTrends(
  profile: UserTasteProfile,
): Promise<string> {
  const ai = getGeminiClient();
  logger.info("TrendAnalyst", "Running Food Trend Analyst Agent...");

  try {
    const cuisinesStr = Array.isArray(profile.cuisines)
      ? profile.cuisines.join(", ")
      : "various cuisines";
    const trendResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: buildTrendPrompt(cuisinesStr) }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: {
          parts: [{ text: TREND_ANALYST_SYSTEM }],
        },
      },
    });

    // Explicitly guard against non-text parts (like executableCode)
    const trendReportText =
      trendResponse.candidates?.[0]?.content?.parts
        ?.filter((p) => p.text)
        .map((p) => p.text)
        .join("") || "No trends found.";
    logger.info("TrendAnalyst", "Trend Report generated successfully.");
    return trendReportText;
  } catch (error: any) {
    logger.error("TrendAnalyst", "Error in Food Trend Analyst Agent:", error);
    logger.info("TrendAnalyst", "Continuing without trend report due to error.");
    // Return the error message but don't re-throw as the pipeline can continue without trends
    return `Trend analysis failed: ${error.message}`;
  }
}
