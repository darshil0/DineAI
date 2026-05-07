# Agent Skills: Technical Specification

This document provides a detailed technical specification for the modular "Agent Skills" architecture used in DineAI. Each skill is a composable, independently testable TypeScript function that the orchestrator uses to perform specific tasks.

## 🧱 Skill Interface Definition

All skills implement a standard interface to ensure consistent registration and execution:

```typescript
interface AgentSkill<I, O> {
  name: string;
  description: string;
  run: (input: I) => Promise<O>;
}
```

---

## 🛠️ Core Skills Catalog

### 1. `extractCuisines`
**Purpose**: Parses unstructured user text to identify specific, canonical cuisine names.

| Specification | Value |
| :--- | :--- |
| **Model** | `gemini-2.0-flash` |
| **Input** | `{ text: string }` |
| **Output** | `{ cuisines: string[] }` |
| **Strategy** | Zero-shot extraction using Gemini Structured Outputs. |
| **File** | `src/skills/extractCuisines.ts` |

---

### 2. `analyzeFoodPhoto`
**Purpose**: Multimodal analysis of dining photos to infer food categories and restaurant ambiance.

| Specification | Value |
| :--- | :--- |
| **Model** | `gemini-2.0-flash` (Vision) |
| **Input** | `{ data: string (base64), mimeType: string }` |
| **Output** | `{ cuisines: string[], ambiance: string[], description: string }` |
| **File** | `src/skills/analyzeFoodPhoto.ts` |

---

### 3. `generateEmbedding`
**Purpose**: Generates high-dimensional vector representations for semantic search.

| Specification | Value |
| :--- | :--- |
| **Model** | `gemini-embedding-2-preview` |
| **Input** | `{ text: string }` |
| **Output** | `{ embedding: number[] }` |
| **Dimensions** | 768 (Standard) |
| **File** | `src/skills/generateEmbedding.ts` |

---

### 4. `scoreRestaurant`
**Purpose**: A localized business logic engine that computes match relevance and explainable rationales.

| Specification | Value |
| :--- | :--- |
| **Model** | Heuristic (Deterministic) |
| **Input** | `{ profile: UserTasteProfile, restaurant: Restaurant, similarity?: number }` |
| **Output** | `{ matchScore: number, rationale: string }` |
| **Weights** | Cuisine (0.4), Price (0.3), Ambiance (0.2), Dietary (0.1) |
| **File** | `src/skills/scoreRestaurant.ts` |

---

### 5. `extractTrendsFromSearchResults`
**Purpose**: Synthesizes raw web search snippets into structured culinary trends.

| Specification | Value |
| :--- | :--- |
| **Model** | `gemini-2.0-flash` |
| **Input** | `{ results: any[] (Raw search results) }` |
| **Output** | `{ cuisines: string[], new_openings: string[], viral_dishes: string[] }` |
| **File** | `src/skills/extractTrendsFromSearchResults.ts` |

---

### 6. `classifyTrendRelevanceToProfile`
**Purpose**: Evaluates the intersection between current trends and a specific user's taste profile.

| Specification | Value |
| :--- | :--- |
| **Model** | `gemini-2.5-pro-preview-05-06` |
| **Input** | `{ profile: UserTasteProfile, trend: string }` |
| **Output** | `{ relevance_score: number, connection_rationale: string }` |
| **File** | `src/skills/classifyTrendRelevanceToProfile.ts` |

---

## 🛡️ Error Handling Standards

All skills MUST adhere to the following reliability standards:

1. **Transient Failures**: Skills do not handle retries internally; they must be wrapped in `withRetry` by the orchestrator.
2. **Terminal Errors**: If a skill fails due to invalid input or persistent API failure, it must throw a `SkillError` providing its name and the original cause.
3. **Empty States**: If no results are found (e.g., no cuisines extracted), skills must return a valid "empty" response (e.g., `[]`) rather than throwing an error.

## 🧪 Testing Requirement

Every skill has a corresponding test file in `src/skills/__tests__/` that verifies:
- Correct output schema validation.
- Handling of edge cases (e.g., empty strings).
- Deterministic logic (for heuristic skills).
