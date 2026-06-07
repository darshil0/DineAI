# Agent Skills: Technical Specification

This document defines the modular **Agent Skills** architecture used in DineAI. Each skill is a composable, independently testable TypeScript function used by the orchestrator to perform a specific task.

## Skill interface

All skills implement a standard interface to ensure consistent registration and execution:

```typescript
interface AgentSkill<I, O> {
  name: string;
  description: string;
  run: (input: I) => Promise<O>;
}
```

## Core skills catalog

### 1. `extractCuisines`

**Purpose**: Parse unstructured user text to identify canonical cuisine names.

| Specification | Value |
| :--- | :--- |
| Model | `gemini-2.0-flash` |
| Input | `{ text: string }` |
| Output | `{ cuisines: string[] }` |
| Strategy | Zero-shot extraction using Gemini Structured Outputs. |
| File | `src/skills/extractCuisines.ts` |

### 2. `analyzeFoodPhoto`

**Purpose**: Perform multimodal analysis of dining photos to infer food categories and restaurant ambiance.

| Specification | Value |
| :--- | :--- |
| Model | `gemini-2.0-flash` |
| Input | `{ data: string; mimeType: string }` |
| Output | `{ cuisines: string[]; ambiance: string[]; description: string }` |
| Strategy | Multimodal image analysis using Gemini vision capabilities. |
| File | `src/skills/analyzeFoodPhoto.ts` |

### 3. `generateEmbedding`

**Purpose**: Generate vector representations for semantic search.

| Specification | Value |
| :--- | :--- |
| Model | `gemini-embedding-2-preview` |
| Input | `{ text: string }` |
| Output | `{ embedding: number[] }` |
| Dimensions | `768` |
| File | `src/skills/generateEmbedding.ts` |

### 4. `scoreRestaurant`

**Purpose**: Compute match relevance and explainable rationales using deterministic business logic.

| Specification | Value |
| :--- | :--- |
| Model | Heuristic (deterministic) |
| Input | `{ profile: UserTasteProfile; restaurant: Restaurant; similarity?: number }` |
| Output | `{ matchScore: number; rationale: string }` |
| Weights | Cuisine `0.4`, Price `0.3`, Ambiance `0.2`, Dietary `0.1` |
| File | `src/skills/scoreRestaurant.ts` |

### 5. `extractTrendsFromSearchResults`

**Purpose**: Synthesize raw web search snippets into structured culinary trends.

| Specification | Value |
| :--- | :--- |
| Model | `gemini-2.0-flash` |
| Input | `{ results: unknown[] }` |
| Output | `{ trendingCuisines: string[]; newOpenings: string[]; viralDishes: string[]; summary: string }` |
| File | `src/skills/extractTrendsFromSearchResults.ts` |

### 6. `classifyTrendRelevanceToProfile`

**Purpose**: Evaluate the intersection between current trends and a specific user's taste profile.

| Specification | Value |
| :--- | :--- |
| Model | `gemini-2.5-pro-preview-06-05` |
| Input | `{ profile: UserTasteProfile; trends: { trendingCuisines: string[]; newOpenings: string[]; viralDishes: string[] } }` |
| Output | `{ relevantCuisines: string[]; relevantOpenings: string[]; relevantDishes: string[]; overallRelevanceScore: number; rationale: string }` |
| File | `src/skills/classifyTrendRelevanceToProfile.ts` |

## Error handling standards

All skills MUST adhere to the following reliability standards:

1. **Transient failures**: Skills do not retry internally. They must be wrapped in `withRetry` by the orchestrator. Retry behavior should be centralized so it is consistent across skills. [npmjs](https://www.npmjs.com/package/ts-retry?activeTab=readme)
2. **Terminal errors**: If a skill fails due to invalid input or a persistent API failure, it must throw a `SkillError` that includes the skill name and the original cause.
3. **Empty states**: If no results are found, skills must return a valid empty response rather than throwing an error, such as `[]` or an object with empty arrays as appropriate.

## Testing requirements

Every skill must have a corresponding test file in `src/skills/__tests__/` that verifies:

- Correct output schema validation.
- Handling of edge cases, including empty strings and empty result sets.
- Deterministic logic for heuristic skills.
- Proper error propagation for invalid input and unrecoverable failures.
