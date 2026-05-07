# Agent Development Guide: Culinary Trend Agent

This document outlines the architectural patterns, reliability standards, and development workflows for the DineAI multi-agent orchestrator.

## 🤖 Multi-Agent Orchestration

The application uses a sequential pipeline of specialized agents to deliver high-quality, trend-aware recommendations. Each agent operates on the shared `UserTasteProfile` and `CandidateList`.

### 1. The Pipeline
1.  **Profile Builder (`src/services/profileBuilder.ts`)**: Analyzes conversation history and images to generate a structured `UserTasteProfile`.
2.  **RAG Recommender (`src/services/ragRecommender.ts`)**: Performs vector search and heuristic re-ranking to identify candidates.
3.  **Trend Analyst (`src/services/trendAnalyst.ts`)**: Uses Google Search grounding to find real-time trends for the user's preferred cuisines.
4.  **Finalizer (`src/services/finalizer.ts`)**: Synthesizes the taste profile, restaurant candidates, and trends into a final ranked set.

---

## 🛡️ Reliability & Resilience Standards

### 1. API Retry Policy
To handle transient `429 Too Many Requests` or `5xx` errors from the Gemini API, **all model calls must be wrapped in the `withRetry` utility**.

- **Implementation**: Use exponential backoff (starting at 1s) with a maximum of 3 retries.
- **Scope**: Includes both top-level agent services and individual skill executions.

### 2. Dual-Model Selection Strategy
We balance speed and reasoning depth through a tiered model approach:
- **Performance Tier (`gemini-2.0-flash`)**: Used for text extraction, vision analysis, and intermediate classification.
- **Reasoning Tier (`gemini-2.5-pro-preview-05-06`)**: Reserved for high-complexity tasks like final recommendation synthesis and Google Search grounding.

### 3. Parsing Robustness
To handle non-deterministic LLM output (e.g., markdown-wrapped JSON), all parsing MUST use the `cleanJson` utility before calling `JSON.parse`.

---

## 🎨 Frontend & UX Patterns

### 1. Skeleton UI Loading
To maintain high perceived performance during the 5-10s multi-agent loop, use shimmer skeletons:
- `TasteProfileBadge`: Displays an identity skeleton.
- `RecommendationCard`: Displays a card skeleton.
- Integration: Managed via the `isLoading` state in `ChatInterface.tsx`.

### 2. Feedback Integration
User interactions ("Like"/"Dislike") are critical signals. Feedback is:
1. Queued in the local component state.
2. Appended as high-priority natural language context to the next prompt.
3. Used to explicitly update the `disliked_cuisines` and `avoid_patterns` fields in the profile.

---

## 💾 Data & Vector DB Strategy

### 1. Vector Ingestion
Restaurant data (`src/data/restaurants.ts`) must be embedded and ingested into the `LocalVectorDB` for semantic search.
- **Deduplication**: Ingestion uses an `upsert` strategy (keyed by `name-neighborhood`) to prevent duplicate records on server restart.
- **Caching**: The `embeddings_cache.db` (SQLite) stores pre-computed embeddings to ensure zero-cost API calls for static data.

### 2. Context Management
To prevent context window pollution and prompt injection:
- **History Truncation**: Only the last 10 exchanges are passed to the LLM.
- **Structured Output**: Every agent response is validated against a Zod schema to ensure system integrity.

---

## 🧪 Development Standards

### 1. Telemetry
Every agent request must log its execution latency to the console. This telemetry is used to identify bottlenecks in the pipeline.

### 2. Type Safety
- **Extensions**: Use `.js` extensions in ESM imports as required by the `tsx` runtime.
- **Schemas**: Always use the schemas defined in `src/schemas/index.ts` for consistency.

### 3. Testing
Before merging changes to the core orchestrator, run:
```bash
npx tsx src/lib/__tests__/utils.test.ts
npx tsx src/lib/__tests__/vectorDb.test.ts
npx tsx src/skills/__tests__/scoreRestaurant.test.ts
```
