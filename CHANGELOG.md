# Changelog

## [2.3.1] - 2026-05-06
### Changed
- **Codebase Cleanup**: Removed redundant and unused root-level files (`metadata.json`, `ChatInterface.tsx`, `trendAnalyst.ts`, `classifyTrendRelevanceToProfile.ts`) to improve project structure and resolve TypeScript resolution conflicts.
- **UI Logic**: Centralized message submission in `src/components/ChatInterface.tsx` within a `submitMessage` handler to ensure consistent behavior across keyboard and button interactions.
- **Heuristic Scoring**: Formalized match weight distribution in `src/skills/scoreRestaurant.ts` (Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1) for more predictable recommendation ranking.

### Added
- **System Verification**: Introduced `src/scripts/verifySystem.ts` for automated end-to-end validation of agent skills and recommendation pipelines.

## [2.3.0] - 2026-05-06
### Fixed - Critical Stability & Reliability

**Type Safety & Imports**
- Fixed Type import conflict in `src/schemas/recommendation.ts` by renaming `Type` import to `SchemaType` to prevent namespace collisions with other imported types.
- Updated all schema definitions to use `SchemaType` consistently throughout the codebase to ensure type-safe Zod validation.

**API Error Recovery (429 Rate Limiting)**
- **Critical:** Added `withRetry()` wrapper to `src/services/finalizer.ts` for the `finalizeRecommendations()` function. Previously, rate limit errors (429 Too Many Requests) would cause immediate failure instead of exponential backoff retry.
- **Critical:** Added `withRetry()` wrapper to the fallback LLM filtering branch in `src/services/ragRecommender.ts` for consistency. Vector DB failures now gracefully fall back with proper retry logic.
- All Gemini API calls across the recommendation pipeline are now wrapped with exponential backoff (starting at 1s, doubling up to 8s, with 3 retries by default).

**Data Validation & Integrity**
- Enhanced history validation in `src/api/chat.ts` with a new `validateHistoryIntegrity()` function that enforces role alternation rules and detects potential adversarial prompt injection attempts.
- Added explicit role field validation using Zod's `z.enum()` to ensure only `'user'` and `'assistant'` roles are accepted, preventing role spoofing.
- Implemented file size re-validation in the request handler (after Multer processing) to catch edge cases where oversized files might slip through.

**Skill Output Validation**
- Fixed profile enrichment logic in `src/services/profileBuilder.ts` to properly validate skill outputs before string concatenation. Added explicit null checks and array validation for cuisines and ambiance results.
- Implemented array existence and length checks before joining cuisine lists to prevent `undefined.join()` errors and malformed context.
- Added fallback handling for photo analysis output to ensure `description`, `cuisines`, and `ambiance` fields are properly typed before use.

**Trend Analysis Robustness**
- Fixed null coalescing in `src/services/trendAnalyst.ts` to handle empty cuisine arrays. The function now falls back to `['various cuisines']` when the profile contains no cuisines, ensuring the search query is never empty.
- Enhanced structured trend output validation in all skill outputs (relevantCuisines, relevantOpenings, relevantDishes) to verify arrays exist before joining them.
- Added relevance score validation to ensure `overallRelevanceScore` is a valid number before multiplication and rounding.

**Graceful Shutdown & Resource Management**
- Fixed asynchronous shutdown handling in `server.ts` with proper error handling and a 5-second timeout guard to prevent process hangs during shutdown.
- Vector DB save operation is now properly called during shutdown, ensuring the index file is flushed to disk before process exit.
- Added shutdown state flag to prevent multiple shutdown handlers from running concurrently.

### Changed - Enhanced Reliability

**Error Handling Architecture**
- Refactored error handling in `src/services/trendAnalyst.ts` to preserve error context through custom error classes (`SkillError` vs `AgentServiceError`). This enables better debugging and error differentiation.
- Ensured all promise rejections in parallel operations (Promise.all) are properly caught and wrapped in `AgentServiceError` or `SkillError` as appropriate.
- Added explicit error logging for skill execution failures with descriptive messages indicating which skill failed and why.

**Validation & Input Sanitization**
- Message sanitization now enforces non-empty requirement only when no image is provided, allowing image-only requests to proceed with a sensible default prompt.
- History validation now enforces a maximum of 10 exchanges to prevent context poisoning and reduce token consumption.
- Added validation for parsed JSON objects to ensure they are dictionaries before treating them as taste profiles.

### Added - Observability

**Telemetry & Debugging**
- Environment variable logging in server startup to help identify deployment configuration issues.
- Enhanced error messages for missing or unregistered skills with clearer diagnostic information.

### Testing

**Updated Test Coverage**
- Verified `withRetry()` handles 429, 5xx, and network errors with exponential backoff (see `src/lib/__tests__/utils.test.ts`).
- Confirmed Vector DB query and normalization produce consistent cosine similarity scores (see `src/lib/__tests__/vectorDb.test.ts`).
- Validated `scoreRestaurant` heuristics enforce correct weight distribution (Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1) with penalty logic for mismatches (see `src/skills/__tests__/scoreRestaurant.test.ts`).

---

## [2.2.0] - 2026-05-01
### Added
- **Onboarding**: Multi-step interactive tutorial for new users.
- **Persistence**: 
    - Chat history saved to `localStorage`.
    - Vector index serializes to `vector_index.json` on shutdown.
- **Favorites**: Ability to "Heart" restaurants for persistent storage.
- **Telemetry**: Server-side latency logging for agent stages.

### Fixed
- **Stability**: 
    - Added `withRetry` wrappers to all Gemini API calls (Embeddings, Vision, Search).
    - Fixed memory leaks in `ChatInterface` by clearing dangling timeouts.
    - Resolved `[object Object]` serialization bug in `ProfileBuilder`.
- **Logic**: 
    - Fixed `setInitialMessage` hoisting issue via `useCallback`.
    - Restricted `ingestRestaurants` to run only on empty or corrupt indices.

---

## [2.1.0] - 2026-05-01
### Added
- **Filter UI**: Advanced multi-select dropdown for Cuisines, Prices, and Neighborhoods.
- **Selection Logic**: Filter bar supports concurrent facets with instant feedback.

---

## [2.0.0] - 2026-05-01
### Changed
- **Major Dependency Refresh**: Upgraded to **React 19**, **Vite 7**, and latest Gemini SDKs.
- **Tooling**: Integrated Prettier with Tailwind CSS plugin for uniform styling.

---

## [1.9.0] - 2026-04-30
### Added
- **Dynamic Context**: Recommendations now include explicit tags for cuisine, price, and neighborhood.
- **Real-time Filtering**: Surface-only filter options relevant to the active recommendation set.

---

## [1.8.0] - 2026-04-30
### Added
- **Feedback Loop**: "Like/Dislike" buttons to refine taste profiles in real-time.
- **Geolocation**: Browser-based neighborhood detection.
- **Actionable Cards**: Deep links for Google Maps navigation.
### Improved
- **Schema**: Added `disliked_cuisines` and `avoid_patterns` to `UserTasteProfile`.

---

## [1.6.0] - 2026-04-30
### Added
- **Performance**: 
    - Polished skeleton screens for `RecommendationCard` and `TasteProfileBadge`.
    - SQLite-based cache (`embeddings_cache.db`) for restaurant embeddings.

---

## [1.4.0] - 2026-03-19
### Added
- **Error Architecture**: Centralized error classes (`AppError`, `AgentServiceError`, `SkillError`).
- **Resilience**: Recursive `withRetry` utility with exponential backoff for 429 errors.

---

## [1.2.0] - 2026-03-19
### Added
- **Neighborhood Awareness**: Added support for "West Village", "SoHo", etc.
- **Trend Pipeline**: Refactored `Trend Analyst` into a multi-step extraction and classification pipeline.

---

## [1.0.0] - 2026-01-10
### Initial Release
- **Core Orchestrator**: Basic Express backend and agent pipeline.
- **Semantic Search**: In-memory vector database integration.
- **UI**: Foundation React interface with static filtering.
