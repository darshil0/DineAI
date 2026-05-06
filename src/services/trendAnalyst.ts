import { DynamicRetrievalConfigMode } from '@google/genai';
import { getGeminiClient } from '../lib/geminiClient.js';
import { UserTasteProfile } from '../schemas/index.js';
import { TREND_ANALYST_SYSTEM, buildTrendPrompt } from '../prompts/index.js';
import { getSkill } from '../skills/registry.js';
import { AgentServiceError, SkillError } from '../lib/errors.js';
import { withRetry } from '../lib/utils.js';

export async function analyzeTrends(
  profile: UserTasteProfile,
  location: string = 'New York City',
): Promise<string> {
  const ai = getGeminiClient();
  console.log(`Running Food Trend Analyst Agent with Skills for ${location}...`);

  try {
    // Proper null coalescing: handle empty arrays and undefined
    const cuisines =
      Array.isArray(profile.cuisines) && profile.cuisines.length > 0
        ? profile.cuisines
        : ['various cuisines'];
    const cuisinesStr = cuisines.join(', ');

    // 1. Get raw search results using Google Search with proper retry wrapping
    const trendResponse = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: buildTrendPrompt(cuisinesStr),
        config: {
          tools: [
            {
              googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                  mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
                },
              },
            },
          ],
          systemInstruction: TREND_ANALYST_SYSTEM,
        },
      }),
    );

    const rawSearchResults = trendResponse.text || 'No trends found.';

    // 2. Extract structured trends using skill with proper error handling
    const extractSkill = getSkill<any, any>('extractTrendsFromSearchResults');
    if (!extractSkill) {
      throw new AgentServiceError(
        'Trend Analyst',
        new Error("Required skill 'extractTrendsFromSearchResults' not found."),
      );
    }

    const structuredTrends = await withRetry(() =>
      extractSkill.run({
        searchResults: rawSearchResults,
        city: location,
      }),
    ).catch((e) => {
      throw new SkillError('extractTrendsFromSearchResults', e);
    });

    // 3. Classify relevance to user profile using skill with proper error handling
    const classifySkill = getSkill<any, any>('classifyTrendRelevanceToProfile');
    if (!classifySkill) {
      throw new AgentServiceError(
        'Trend Analyst',
        new Error("Required skill 'classifyTrendRelevanceToProfile' not found."),
      );
    }

    const relevanceReport = await withRetry(() =>
      classifySkill.run({
        profile,
        trends: structuredTrends,
      }),
    ).catch((e) => {
      throw new SkillError('classifyTrendRelevanceToProfile', e);
    });

    // 4. Construct final report with validated data
    const trendsummary = structuredTrends.summary || 'No trend analysis available.';
    const rationale = relevanceReport.rationale || 'Unable to determine trend relevance.';
    const relevantCuisines = Array.isArray(relevanceReport.relevantCuisines)
      ? relevanceReport.relevantCuisines.join(', ')
      : 'None matching your profile';
    const relevantOpenings = Array.isArray(relevanceReport.relevantOpenings)
      ? relevanceReport.relevantOpenings.join(', ')
      : 'None matching your profile';
    const relevantDishes = Array.isArray(relevanceReport.relevantDishes)
      ? relevanceReport.relevantDishes.join(', ')
      : 'None matching your profile';
    const relevanceScore =
      typeof relevanceReport.overallRelevanceScore === 'number'
        ? Math.round(relevanceReport.overallRelevanceScore * 100)
        : 0;

    const finalReport = `
### Food Trends in ${location}
${trendsummary}

#### Relevant to Your Profile
${rationale}

**Trending Cuisines:** ${relevantCuisines}
**New Openings:** ${relevantOpenings}
**Viral Dishes:** ${relevantDishes}

*Overall Relevance Score: ${relevanceScore}%*
    `.trim();

    console.log('Personalized Trend Report Generated.');
    return finalReport;
  } catch (error: any) {
    if (error instanceof SkillError || error instanceof AgentServiceError) throw error;
    throw new AgentServiceError('Trend Analyst', error);
  }
}
