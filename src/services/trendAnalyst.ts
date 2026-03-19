import { getGeminiClient } from "../lib/geminiClient.js";
import { UserTasteProfile } from "../schemas/index.js";
import { TREND_ANALYST_SYSTEM, buildTrendPrompt } from "../prompts/index.js";
import { getSkill } from "../skills/registry.js";
import { AgentServiceError, SkillError } from "../lib/errors.js";

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
    const extractSkill = getSkill<any, any>("extractTrendsFromSearchResults");
    if (!extractSkill) {
      throw new Error("Required skill 'extractTrendsFromSearchResults' not found.");
    }
    const structuredTrends = await extractSkill.run({
      searchResults: rawSearchResults,
      city: "New York City" // Defaulting to NYC as per PRD context
    }).catch(e => { throw new SkillError("extractTrendsFromSearchResults", e); });

    // 3. Classify relevance to user profile using skill
    const classifySkill = getSkill<any, any>("classifyTrendRelevanceToProfile");
    if (!classifySkill) {
      throw new Error("Required skill 'classifyTrendRelevanceToProfile' not found.");
    }
    const relevanceReport = await classifySkill.run({
      profile,
      trends: structuredTrends
    }).catch(e => { throw new SkillError("classifyTrendRelevanceToProfile", e); });

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
    if (error instanceof SkillError) throw error;
    throw new AgentServiceError("Trend Analyst", error);
  }
}
