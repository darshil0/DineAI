# Agent Development Guide: Culinary Trend Agent

This document outlines the architectural patterns, critical constraints, and development standards for the Culinary Trend Agent application.

## 🤖 Multi-Agent Orchestration

The application uses a sequential pipeline of specialized agents to deliver high-quality, trend-aware recommendations:

1.  **Profile Builder (`src/services/profileBuilder.ts`)**: Analyzes conversation history and images to generate a `UserTasteProfile`.
2.  **RAG Recommender (`src/services/ragRecommender.ts`)**: Performs vector search against the restaurant database and uses LLM filtering to identify candidates matching the profile.
3.  **Trend Analyst (`src/services/trendAnalyst.ts`)**: Uses Google Search grounding to find real-time trends for the user's preferred cuisines.
4.  **Finalizer (`src/services/finalizer.ts`)**: Synthesizes the taste profile, restaurant candidates, and trends into a final set of ranked recommendations.

## 🛡️ Reliability & Resilience

### 1. API Retry Logic
To handle transient `429 Too Many Requests` errors from the Gemini API, **all model calls must be wrapped in the `withRetry` utility** found in `src/lib/utils.ts`.
- **Standard Pattern**: `await withRetry(() => ai.models.generateContent({ ... }))`
- **Configuration**: Uses exponential backoff (starting at 1s) with a maximum of 3 retries.

### 2. Embeddings Cache
The application uses a persistent SQLite cache for vector embeddings (`embeddings_cache.db`) to:
- Avoid redundant API calls for static restaurant data.
- Speed up the `ingestRestaurants` script significantly.
- Minimize development costs and latency.
- Ref: `src/lib/cache.ts`

## 🎨 Frontend & UX Patterns

### 1. Skeleton Loading
To improve perceived performance during the multi-agent processing loop, use the `loading` prop on these components:
- `TasteProfileBadge`: Shows a shimmering identity skeleton.
- `RecommendationCard`: Shows a shimmering card skeleton.
- These are integrated into `ChatInterface.tsx` when `isLoading` is true.

### 2. Auto-Focus
The chat input textarea should automatically regain focus whenever:
- The page first loads.
- A loading operation completes, allowing the user to continue the conversation immediately.

## 💾 Data & Vector DB

- **Vector DB**: A custom implementation in `src/lib/vectorDb.ts` using cosine similarity.
- **Ingestion**: Restaurant data (`src/data/restaurants.ts`) must be embedded and ingested into the vector DB for the RAG recommender to function.
- **Batched Processing**: The ingestion script (`src/scripts/ingestRestaurants.ts`) processes items in chunks of 5 to avoid API congestion.

## 🧪 Testing Utilities

When modifying core logic, run the built-in tests to ensure stability:
```bash
npx tsx src/lib/__tests__/utils.test.ts
npx tsx src/lib/__tests__/vectorDb.test.ts
npx tsx src/skills/__tests__/scoreRestaurant.test.ts
```
