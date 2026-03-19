import { getGeminiClient } from "../lib/geminiClient.js";
import { UserTasteProfile } from "../schemas/index.js";
import { TREND_ANALYST_SYSTEM, buildTrendPrompt } from "../prompts/index.js";
import { getSkill } from "../skills/registry.js";

export async function analyzeTrends(profile: UserTasteProfile): Promise<string> {
  const ai = getGeminiClient();
  console.log("Running Food Trend Analyst Agent with Skills...");

  try {
    const cuisinesStr = Array.isArray(profile.cuisines) ? profile.cuisines.join(", ") : "various cuisines";

    // 1. Get raw search results using Google Search
    const trendResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: buildTrendPrompt(cuisinesStr),
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: TREND_ANALYST_SYSTEM,
      },
    });

    const rawSearchResults = trendResponse.text || "No trends found.";

    // 2. Extract structured trends using skill
    // FIX: getSkill() returns AgentSkill | undefined. Calling .run() without a
    // null check causes a guaranteed runtime TypeError if the skill is not registered.
    const extractSkill = getSkill<any, any>("extractTrendsFromSearchResults");
    if (!extractSkill) {
      throw new Error("Required skill 'extractTrendsFromSearchResults' is not registered.");
    }
    const structuredTrends = await extractSkill.run({
      searchResults: rawSearchResults,
      city: "New York City"
    });

    // 3. Classify relevance to user profile using skill
    const classifySkill = getSkill<any, any>("classifyTrendRelevanceToProfile");
    if (!classifySkill) {
      throw new Error("Required skill 'classifyTrendRelevanceToProfile' is not registered.");
    }
    const relevanceReport = await classifySkill.run({
      profile,
      trends: structuredTrends
    });

    // 4. Construct final report
    const finalReport = `
### Food Trends in NYC
${structuredTrends.summary}

#### Relevant to Your Profile
${relevanceReport.rationale}

**Trending Cuisines:** ${relevanceReport.relevantCuisines.join(", ") || "None matching your profile"}
**New Openings:** ${relevanceReport.relevantOpenings.join(", ") || "None matching your profile"}
**Viral Dishes:** ${relevanceReport.relevantDishes.join(", ") || "None matching your profile"}

*Overall Relevance Score: ${Math.round(relevanceReport.overallRelevanceScore * 100)}%*
    `.trim();

    console.log("Personalized Trend Report Generated.");
    return finalReport;
  } catch (error: any) {
    console.error("Error in Food Trend Analyst Agent:", error);
    return `Trend analysis failed: ${error.message}`;
  }
}
