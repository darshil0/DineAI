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

To handle transient `429 Too Many Requests` errors from the Gemini API, **all model calls and skill executions must be wrapped in the `withRetry` utility** found in `src/lib/utils.ts`.

- **Standard Pattern**: `await withRetry(() => ai.models.generateContent({ ... }))` or `await withRetry(() => mySkill.run({ ... }))`
- **Configuration**: Uses exponential backoff (starting at 1s) with a maximum of 3 retries.

### 2. Prompt Serialization
When passing state objects (like the `UserTasteProfile`) into LLM prompts, **always explicitly stringify the objects** (e.g., `JSON.stringify(profile)`). Native template literal interpolation may result in `[object Object]` strings, which can degrade model performance.

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

### 2. Auto-Focus & Stable Initial State

- **Auto-Focus**: The chat input textarea should automatically regain focus whenever the page loads or a loading operation completes.
- **Initial State Hoisting**: Any function that initializes the message history (e.g., `setInitialMessage`) should be wrapped in `useCallback` and defined before its use in `useEffect` to ensure stable references and avoid linting/runtime errors.

### 3. Feedback Loop

Users can provide "Like" or "Dislike" feedback on recommendations. This feedback is:

- Queued in the `ChatInterface` state.
- Automatically appended as high-priority natural language context to the next user message sent to the Profile Builder.
- Used to explicitly populate `disliked_cuisines` and `avoid_patterns` in the taste profile.

### 4. Dynamic Filtering

The `ChatInterface` implements a client-side filtering layer for the latest assistant message:

- Valid facets are extracted dynamically from the current recommendation set (Cuisine, Price Level, Neighborhood).
- Filters are reset automatically upon submitting a new request to ensure consistency.

### 5. Onboarding & Education

The `OnboardingTutorial` component is triggered on first visit:
- **Persistence**: Completion is tracked in `localStorage` under `dineai_onboarding_completed`.
- **Interaction**: Uses `motion/react` for smooth step transitions and dismissible behavior.

### 6. Favorites Management

Users can bookmark recommendations for later:
- **Persistence**: Favorited restaurants are stored in `localStorage` under `dineai_favorites`.
- **UI**: A global toggle in the header switches between the live chat and the favorites gallery.

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

## 🛡️ Security & Constraints

### 1. Architectural Decisions
- **Runtime (`tsx`)**: The application uses `tsx` in production to support the fast-iteration lifecycle of AI Studio. While functional, standalone high-scale deployments should migrate to `tsc` (pre-compiled `dist/`) for optimized performance.
- **Persistence**:
    - `embeddings_cache.db`: A persistent SQLite cache for vector embeddings. This is **tracked** as it contains pre-computed infrastructure data.
    - `vector_index.json`: A runtime persistence file for the in-memory vector index. This is **ignored** via `.gitignore` as it is a derived artifact populated at runtime or during ingestion.

### 2. Security Invariants
- **Key Isolation**: All API keys (Gemini, etc.) are restricted to `server.ts`. No keys are ever exposed to the client-side bundle.
- **Payload Validation**: The `Chat` API uses `zod` for rigorous schema enforcement of incoming user messages and conversation history.
- **Context Poisoning Mitigation**: 
    - Conversation history is strictly truncated to the **last 10 exchanges** before processing.
    - Assistant roles are enforced via validation to prevent users from injecting spoofed LLM responses into the history buffer.
- **CORS & Headers**: The server implements strict CSRF-avoidance patterns by restricting origins and enforcing JSON content types.

### 3. Known Limitations
- **Cold-Start Ingestion**: On the first run without a `vector_index.json`, the server performs a one-time ingestion of restaurant data. This is guarded by a the `embeddings_cache.db` to ensure zero-cost API calls during this phase.
