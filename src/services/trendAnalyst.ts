import { getGeminiClient } from "../lib/geminiClient.js";
import { UserTasteProfile } from "../schemas/index.js";
import { TREND_ANALYST_SYSTEM, buildTrendPrompt } from "../prompts/index.js";

export async function analyzeTrends(
  profile: UserTasteProfile,
): Promise<string> {
  const ai = getGeminiClient();
  console.log("Running Food Trend Analyst Agent...");

  try {
    const cuisinesStr = Array.isArray(profile.cuisines)
      ? profile.cuisines.join(", ")
      : "various cuisines";
    const trendResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: buildTrendPrompt(cuisinesStr) }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: {
          parts: [{ text: TREND_ANALYST_SYSTEM }],
        },
      },
    });

    const trendReportText =
      trendResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No trends found.";
    console.log("Trend Report:", trendReportText);
    return trendReportText;
  } catch (error: any) {
    console.error("Error in Food Trend Analyst Agent:", error);
    console.log("Continuing without trend report due to error.");
    return `Trend analysis failed: ${error.message}`;
  }
}
