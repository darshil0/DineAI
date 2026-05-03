# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - 2026-05-03

### Fixed — Critical Bugs

- **Profile Serialization Bug (all agents)**: Replaced native template literal interpolation of state objects with explicit `JSON.stringify(profile, null, 2)` calls in `ProfileBuilder`, `TrendAnalyst`, `RAGRecommender`, and `Finalizer` prompts. This prevents the `[object Object]` string from corrupting LLM context and degrading model output quality.
- **Missing `withRetry` Coverage**: Applied `withRetry` wrappers to all previously unguarded Gemini API calls and skill executions across the full agent pipeline:
  - `generateEmbedding` in `ingestRestaurants.ts`
  - `analyzeFoodPhoto` in `profileBuilder.ts`
  - `extractCuisines` (via skill registry in profile building flow)
  - `extractTrendsFromSearchResults` in `trendAnalyst.ts`
  - `classifyTrendRelevanceToProfile` in `trendAnalyst.ts`
  - All `scoreRestaurant` calls in `ragRecommender.ts`
  - Google Search grounding call in `trendAnalyst.ts`
  - Finalizer `generateContent` call in `finalizer.ts`
- **Cold-Start Ingestion Guard**: `ingestRestaurants` now calls `vectorDb.loadFromIndex()` first and only runs the full embedding pipeline when `vectorDb.isEmpty` is `true`. Prevents redundant API calls on every server restart.
- **`instanceof` Prototype Chain**: Fixed `Object.setPrototypeOf(this, new.target.prototype)` in all custom error classes (`AppError`, `AgentServiceError`, `SkillError`, `ValidationError`) to ensure correct `instanceof` checks across transpilation boundaries.
- **History Sanitisation**: `chat.ts` API now enforces both a 10-exchange depth limit (`truncateHistory`) and an assistant-role content verification filter, guarding against context poisoning via spoofed history injection.
- **Multer File Size Limit**: Added explicit 5 MB `fileSize` limit to the multer upload configuration in `chat.ts`, consistent with the documented constraint in CHANGELOG v1.5.0.
- **Skill Registry Guard**: `getSkill` now throws a descriptive error message including the missing skill name and a bootstrap reminder, preventing silent `undefined` returns.

### Added

- **`src/types.ts`**: Centralised shared domain types (`UserTasteProfile`, `Restaurant`, `FinalRecommendation`, `FoodTrend`, `ChatMessage`) to eliminate type duplication and drift across services.
- **`src/lib/gemini.ts`**: `getGeminiClient()` singleton factory and `MODELS` constants — centralises API key handling and model string management across all agents and skills.
- **`src/lib/errors.ts`**: Full custom error hierarchy (`AppError`, `AgentServiceError`, `SkillError`, `ValidationError`) with `handleApiError` utility for consistent API error responses.
- **`src/lib/cache.ts`**: SQLite-backed embeddings cache (`getCachedEmbedding` / `setCachedEmbedding`) wired into `generateEmbeddingSkill` to prevent redundant API calls.
- **`src/lib/utils.ts`**: `withRetry` (recursive exponential backoff, max 3 retries, targeting 429 errors) and `truncateHistory` (configurable exchange-depth window) utilities.
- **`src/lib/vectorDb.ts`**: In-memory vector DB with cosine similarity, `upsert`, `search`, `loadFromIndex`, `saveToIndex`, and `isEmpty` — restored persistence lifecycle integrated with graceful shutdown in `server.ts`.
- **`src/skills/`**: Full modular skill suite — `generateEmbedding`, `extractCuisines`, `analyzeFoodPhoto`, `scoreRestaurant`, `extractTrendsFromSearchResults`, `classifyTrendRelevanceToProfile` — all implementing the `AgentSkill<TInput, TOutput>` interface.
- **`src/skills/registry.ts`**: `registerSkill` and `getSkill` with type-safe generics.
- **`src/skills/bootstrap.ts`**: `bootstrapSkills()` centralises all skill registrations for clean server startup ordering.
- **`src/services/`**: All four agent services fully implemented — `profileBuilder.ts`, `ragRecommender.ts`, `trendAnalyst.ts`, `finalizer.ts`.
- **`src/scripts/ingestRestaurants.ts`**: Batch ingestion (chunks of 5) with embeddings cache integration, `withRetry` on every embed call, and cold-start guard.
- **`src/scripts/verifySystem.ts`**: `npm run verify` smoke-tests env, skill bootstrap, and a live embedding round-trip.
- **`src/data/restaurants.ts`**: 12-entry restaurant knowledge base with full `Restaurant` interface fields (`address`, `phone`, `hours`, `tags`, `rating`).
- **`src/api/chat.ts`**: Express router with Zod schema validation (`ChatRequestSchema`, `ChatMessageSchema`), history sanitisation, per-agent telemetry logging, and `handleApiError` for structured error responses.
- **Per-Agent Telemetry**: Server-side `Date.now()` latency logging for each stage of the pipeline (ProfileBuilder, RAGRecommender, TrendAnalyst, Finalizer, total).
- **Structured Output Schema**: `FinalRecommendationsSchema` added to `finalizer.ts` for Gemini `responseSchema`-enforced structured output validation.

### Changed

- **`scoreRestaurant` — Numeric Price Matching**: Replaced string-based price comparison with numeric proximity scoring. `diff = |restaurant.price_level - targetLevel|`; each level of difference deducts 10 pts from a 30-pt budget, enabling partial matches and graduated penalties (no longer binary hit/miss).
- **`ProfileBuilder` Negative Constraint Prompt**: Clarified system instruction — explicit rule that disliked or avoided items must populate `disliked_cuisines` / `avoid_patterns` only, never `preferred_cuisines`. Fixes Issue #15.
- **RAG Pipeline**: `ragRecommend` now runs semantic search (top 10), applies `scoreRestaurant` re-ranking, then passes candidates through an LLM filter for subtle dietary/avoidance violations before returning the final top 5.
- **Parallel Agent Execution**: RAG Recommender and Trend Analyst now run concurrently via `Promise.all` in `chat.ts`, reducing total pipeline latency.
- **`ingestRestaurants` Batch Size**: Confirmed at 5 items per batch with `Promise.all` within each batch for controlled API throughput.

### Tests

- **`src/lib/__tests__/utils.test.ts`**: 6 unit tests for `withRetry` (success, 429 retry, non-429 no-retry, retry exhaustion) and `truncateHistory` (below limit, above limit).
- **`src/lib/__tests__/vectorDb.test.ts`**: 5 unit tests verifying exact match (score=1.0), 45° cosine (score≈0.7071), orthogonal vectors (score≈0), topK sort order, and `isEmpty` guard.
- **`src/skills/__tests__/scoreRestaurant.test.ts`**: 5 unit tests covering perfect match (score=90), partial price mismatch (numeric diff penalty), disliked cuisine penalty, avoid-pattern tag penalty, and score clamping to [0, 100].

---

## [2.2.0] - 2026-05-01

### Added
- **Interactive Onboarding Tutorial**: A multi-step guide explaining the "Multi-Agent" orchestrator, Taste Profiles, and Trend Analysis.
- **Favorites Management**: Users can now "Heart" restaurants to save them to a persistent favorites list.
- **Conversation Persistence**: Chat history is now automatically saved and restored from `localStorage`.
- **Per-Agent Telemetry**: Added server-side latency logging for each stage of the agent pipeline.

### Fixed
- **Critical Hoisting Bug**: Fixed `setInitialMessage` being undefined on mount in `ChatInterface.tsx` by converting it to a `useCallback` and hoisting its definition.
- **Profile Serialization Bug**: Fixed `[object Object]` interpolation in `ProfileBuilder` prompt by correctly typing and stringifying the `currentProfile` object.
- **Missing Retry Logic**: Comprehensive application of `withRetry` wrappers to all critical skill calls including `generateEmbedding`, `extractCuisines`, `analyzeFoodPhoto`, `extractTrendsFromSearchResults`, and `classifyTrendRelevanceToProfile`.
- **Issue #15**: Corrected ambiguous example in `ProfileBuilder` system prompt regarding negative constraints.
- **Memory Leaks**: Cleaned up dangling timeouts in `ChatInterface` on component unmount.
- **Cold-Start Optimization**: Restricted `ingestRestaurants` to run only if the vector index is empty or corrupted.

### Changed
- **Persistence Strategy**: Vector index now serializes to `vector_index.json` on graceful shutdown and loads on startup.
- **History Sanitization**: Enforced a 10-exchange depth limit and assistant-role verification before processing.
- **Code Cleanup**: Removed multiple unused imports and variables across the codebase (`ChatInterface.tsx`, `profileBuilder.ts`, `finalizer.ts`, `ragRecommender.ts`, etc.).

## [2.1.0] - 2026-05-01

### Added
- **Advanced Multi-Select Filtering**: Refined recommendation interaction with a new dropdown-based filtering system.
- **Custom FilterControls Component**: Dedicated UI for managing multiple intersecting facets (Cuisines, Prices, Neighborhoods).
- **Persistent Selection Logic**: Filter bar now supports multiple concurrent selections with instant UI feedback.

## [2.0.0] - 2026-05-01

### Added
- **Code Prettification**: integrated Prettier with Tailwind CSS plugin for consistent codebase styling.

### Changed
- **Dependency Refresh**: Updated core libraries including React 19, Vite 6, and Gemini SDK to their latest stable versions.
- **Global Formatting**: Applied uniform formatting rules across all source files and markdown documentation.

## [1.9.0] - 2026-05-01

### Added

- **Dynamic Recommendation Filtering**: Users can now filter restaurant results by cuisine, price tier, and neighborhood in real-time.
- **Enhanced Data Richness**: Recommendations now explicitly identify cuisine types, price levels, and neighborhood locations.
- **Smart Refinement UI**: Collaborative filter bar that surface-only options relevant to the current recommendation set.

## [1.8.0] - 2026-05-01

### Added

- **Interactive Feedback Loop**: Users can now "Like" or "Dislike" recommendations to instantly update their taste profiles.
- **Geolocation Integration**: Added browser geolocation support to automatically detect user neighborhoods for local targeting.
- **Improved Profile Visualization**: Refreshed the `TasteProfileBadge` with a split layout showing active preferences vs. identified avoids.
- **Actionable Cards**: Integrated Google Maps navigation and deep links directly into restaurant cards.

### Improved

- **Rich Schema**: Expanded `UserTasteProfile` to include `disliked_cuisines` and `avoid_patterns` for higher recommendation accuracy.
- **Robust Prompting**: Updated multi-agent prompts to handle negative constraints and explicit filtering logic.

## [1.7.0] - 2026-04-30

### Added

- **Trend Synergy Explanations**: The Recommendation Finalizer now explicitly explains how identified food trends connect to your specific taste profile.
- **Enhanced UI**: Added a dedicated "Trend Synergy" section to recommendation cards to visualize the link between viral trends and personal preferences.
- **Detailed Schema**: Updated recommendation schema with `trend_connection` to ensure structured delivery of profile-trend cross-analysis.

## [1.6.0] - 2026-04-30

### Added

- **Skeleton Loading States**: Implemented polished skeleton screens for `RecommendationCard` and `TasteProfileBadge` components to provide better visual feedback during the multi-agent orchestration process.
- **Embeddings Cache**: Added a persistent SQLite-based cache (`embeddings_cache.db`) for restaurant embeddings to significantly speed up vector ingestion and reduce API costs.

### Improved

- **API Resilience**: Integrated robust retry logic with exponential backoff across all agent services (`ProfileBuilder`, `RAGRecommender`, `TrendAnalyst`, and `Finalizer`) to mitigate transient 429 Rate Limit errors.
- **Ingestion Performance**: Optimized the restaurant ingestion script with batch processing to improve throughput and stability.
- **Enhanced UX**: Implemented auto-focus functionality for the chat input after loading completes, streamlining the conversational flow.
- **Perceived Performance**: Integrated skeleton screens directly into the main chat loop to maintain a consistent UI state while background agents are processing.

## [1.5.0] - 2026-03-19

### Added

- **Chat History Persistence**: Implemented local storage persistence for conversation history, allowing users to resume chats across sessions.
- **Clear History Functionality**: Added a "Clear History" button with a confirmation dialog to allow users to reset their conversation.
- **Accessibility Improvements**: Added ARIA labels to interactive elements and improved keyboard navigation support.
- **Image Upload Limits**: Implemented a 5MB size limit for image uploads with user-friendly error feedback.

### Improved

- **Stable List Rendering**: Updated React keys in `ChatInterface.tsx` and `TasteProfileBadge.tsx` to use unique identifiers instead of array indices, preventing rendering issues.
- **UI/UX Refinement**: Updated the page title in `index.html` to "DineAI - Restaurant Recommender" and polished the chat interface layout.
- **Backend Context Support**: Updated the frontend to send full conversation history to the backend API for better context-aware responses.

## [1.4.0] - 2026-03-19

### Added

- **Centralized Error Handling**: Introduced `src/lib/errors.ts` with custom error classes (`AppError`, `AgentServiceError`, `SkillError`, `ValidationError`) for consistent, multi-layered error management.
- **User-Friendly Feedback**: Implemented a `userFriendlyMessage` property in custom errors to provide helpful, non-technical feedback to users while maintaining detailed logs for debugging.
- **Standardized API Error Responses**: Added `handleApiError` utility to ensure all API failures return a consistent JSON structure with both technical and user-facing messages.

### Improved

- **Recursive withRetry Utility**: Refactored `withRetry` in `src/lib/utils.ts` to use a recursive implementation with exponential backoff, specifically targeting 429 rate limit errors.
- **Robust Vector DB Testing**: Updated `src/lib/__tests__/vectorDb.test.ts` with a comprehensive test case for cosine similarity, verifying perfect matches, 45-degree angles, and orthogonal vectors.
- **Agent Service Resilience**: Refactored all core agent services (`profileBuilder`, `ragRecommender`, `trendAnalyst`, and `finalizer`) to use custom error classes, providing better context and observability for failures in the multi-agent pipeline.
- **Input Validation**: Added explicit validation for required fields (e.g., `message`) in the chat API endpoint using the new `ValidationError` class.

## [1.3.0] - 2026-03-19

### Added

- **Detailed Restaurant Info**: Enhanced `RecommendationCard` to display restaurant address, phone number, and operating hours with icons.
- **Enhanced Restaurant Data**: Updated the `Restaurant` interface and sample data in `src/data/restaurants.ts` to include contact and operating details.
- **Schema Updates**: Updated `FinalRecommendationsSchema` to structuredly output restaurant contact information.

### Improved

- **Gemini Model Upgrades**: Transitioned to `gemini-3-flash-preview` for text/vision tasks and `gemini-embedding-2-preview` for semantic search, ensuring the latest and most efficient models are used.
- **Refined Price Matching**: Updated the `scoreRestaurant` skill with numeric price tier mapping, allowing for partial matches and mismatch penalties to better align with user budgets.
- **Standardized AI Clients**: Refactored all agent skills to use a centralized `getGeminiClient` utility for consistent API key handling and configuration.

## [1.2.0] - 2026-03-19

### Added

- **Neighborhood Support**: Users can now specify preferred neighborhoods (e.g., "West Village", "SoHo") in their taste profile.
- **Neighborhood-Aware Recommendations**: Updated the `Profile Builder` to extract neighborhoods and the `RAG Recommender` to boost results based on location.
- **Enhanced Trend Analysis**: Refactored the `Trend Analyst` agent to use a multi-step pipeline with new skills: `extractTrendsFromSearchResults` and `classifyTrendRelevanceToProfile`.
- **Personalized Trend Rationale**: The `Finalizer` agent now explicitly mentions why a restaurant is trending and how it fits the user's neighborhood preferences.
- **UI Enhancements**: Added neighborhood tags with `MapPin` icons to the `TasteProfileBadge` component.

### Fixed

- **Linter Errors**: Fixed property name mismatches in `ingestRestaurants.ts` to ensure smooth data ingestion into the Vector DB.
- **Prompt Refinement**: Improved system instructions for all agents to ensure consistent structured outputs and better reasoning.

## [1.1.0] - 2026-02-15

### Added

- **Multimodal Support**: Added `analyzeFoodPhoto` skill to infer tastes from uploaded dining photos.
- **Vector DB Integration**: Implemented an in-memory vector database for semantic retrieval using Gemini embeddings.
- **Initial Agent Pipeline**: Established the core multi-agent orchestration (Profile Builder, RAG Recommender, Finalizer).

## [1.0.0] - 2026-01-10

### Initial Release

- **Core Chatbot**: Basic restaurant recommendation chat interface.
- **Static Filtering**: Initial rule-based filtering for cuisines and price tiers.
- **Express Backend**: Foundation for agent orchestration.
