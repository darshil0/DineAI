# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **`dotenv.config()` Import-Order Bug** (`server.ts`): `dotenv.config()` was called after `chatRouter` and its dependencies were imported, so any module reading `process.env` (e.g. a singleton Gemini client) at import time would see an undefined API key regardless of a valid `.env` file. Moved `dotenv.config()` to execute before all other imports.
- **Missing Global Error Handler** (`server.ts`): No Express error-handling middleware was registered, so errors thrown from `chatRouter` (including `AppError`/`SkillError` instances) fell through to Express's default handler and leaked raw stack traces instead of the structured `{ statusCode, userFriendlyMessage }` response the error classes were designed to produce. Added a terminal 4-arg error handler registered after all routes and the Vite/static middleware.
- **Malformed Version Table** (`SECURITY.md`): The supported-versions table had two rows collapsed onto a single malformed line, breaking table rendering. Split into two proper rows.
- **Reasoning-Tier Model Name Inconsistency** (`README.md`): The "Model Selection & Resilience" section named `gemini-2.5-pro-preview-05-06`, contradicting the architecture diagram, skills table, and tech stack table in the same file (and `AGENTS.md`), all of which use `gemini-1.5-pro`. Standardized on `gemini-1.5-pro`.

- **Gemini SDK Request Format**: Standardized all model interactions to use the strictly required `{ contents: [{ parts: [...] }], systemInstruction: { parts: [...] } }` structure, resolving intermittent API failures and vision processing errors.
- **Chat API Validation Crash**: Fixed a server-side crash in `src/api/chat.ts` caused by attempting to call `.parse()` on a TypeScript interface. Introduced `UserTasteProfileZodSchema` for proper Zod-based runtime validation of incoming taste profiles.
- **Google Search Grounding**: Updated the `Trend Analyst` agent to use the modern `googleSearchRetrieval` tool configuration with `MODE_DYNAMIC`, ensuring search-grounded responses are properly triggered.
- **Restaurant Scoring Alignment**: Refactored the `scoreRestaurant` skill to align with the canonical design: heuristic weights now sum to 1.0 (Cuisine 0.4, Price 0.3, Ambiance 0.2, Dietary 0.1) and are blended 50/50 with vector similarity when available.
- **ESM & TypeScript Resolution**: Fixed numerous broken imports and missing `.js` extensions across the service and skill layers.
- **Type Safety Hardening**: Resolved over 50 TypeScript errors in core logic by adding missing type definitions, fixing generic constraints on `AgentSkill`, and ensuring proper casting for SDK responses.

### Added
- **UserTasteProfileZodSchema**: A dedicated Zod schema for validating taste profiles in API requests, exported from `src/schemas/userTasteProfile.ts`.

## [2.3.0] - 2026-06-07

### Fixed
- **Missing `cleanJson` Import** (`profileBuilder.ts`): `cleanJson` was called on every profile-building response but never imported from `utils.ts`, causing a `ReferenceError` at runtime that broke every chat request. Added `cleanJson` to the import alongside `withRetry`.
- **`whyMatch` Type Erasure in RAG Pipeline** (`ragRecommender.ts`, `finalizer.ts`): The `recommendCandidates` function returned `Promise<Restaurant[]>`, silently stripping the `whyMatch` and `match_score` fields that `scoreRestaurant` computed and attached to each candidate. Introduced the exported `RestaurantCandidate` type (`Restaurant & { match_score?: number; whyMatch?: string }`) and updated `finalizer.ts` to accept it, ensuring heuristic rationales flow through to the finalizer prompt and recommendation cards correctly.
- **Partial Vector Index Not Re-Ingested** (`ingestRestaurants.ts`): The early-return guard used `existingCount > 0`, which silently skipped re-ingestion whenever even a single record was present. A partial index (caused by a previous interrupted run) would produce incomplete semantic search results with no warning. Changed the guard to `existingCount >= restaurants.length` so only a fully populated index is skipped; partial indexes are detected, logged, and completed.
- **Express v5 Wildcard Route Syntax** (`server.ts`): Express v5 no longer accepts bare `*` wildcards in route paths. The production SPA fallback `app.get('*', ...)` would silently fail to match any route, returning 404 for all non-API paths. Updated to the Express v5 named-parameter syntax: `app.get('/{*splat}', ...)`.

### Changed
- **Dependency Upgrades**: Updated all dependencies to their latest compatible versions (see table below). The `@google/genai` v1 → v2 major bump introduces breaking changes only in the Interactions API; the `generateContent` and `embedContent` calls used throughout DineAI are unaffected.

| Package | From | To | Type |
| --- | --- | --- | --- |
| `@google/genai` | `^1.51.0` | `^2.8.0` | Major |
| `express` | `^4.21.2` | `^5.2.1` | Major |
| `@vitejs/plugin-react` | `^5.0.4` | `^6.0.2` | Major |
| `@types/express` | `^4.17.21` | `^5.0.6` | Major |
| `@types/node` | `^22.14.0` | `^25.9.2` | Major |
| `@tailwindcss/vite` | `^4.1.14` | `^4.3.0` | Minor |
| `tailwindcss` | `^4.1.14` | `^4.3.0` | Minor |
| `dotenv` | `^17.2.3` | `^17.4.2` | Minor |
| `lucide-react` | `^1.14.0` | `^1.17.0` | Minor |
| `@types/multer` | `^2.0.0` | `^2.1.0` | Minor |
| `autoprefixer` | `^10.4.21` | `^10.5.0` | Minor |
| `better-sqlite3` | `^12.4.1` | `^12.10.0` | Patch |
| `motion` | `^12.38.0` | `^12.40.0` | Patch |
| `multer` | `^2.1.0` | `^2.1.1` | Patch |
| `react` | `^19.2.5` | `^19.2.7` | Patch |
| `react-dom` | `^19.2.5` | `^19.2.7` | Patch |
| `tsx` | `^4.21.0` | `^4.22.4` | Patch |
| `typescript` | `~5.8.2` | `~5.9.3` | Patch |
| `vite` | `^8.0.10` | `^8.0.16` | Patch |
| `zod` | `^4.4.2` | `^4.4.3` | Patch |

---

## [2.2.9] - 2026-06-07

### Added
- **Contributing Guidelines**: Created `CONTRIBUTING.md` to establish clear contribution standards, coding practices, and testing workflows.
- **Security Policy**: Added `SECURITY.md` to provide a clear process for reporting vulnerabilities and document security best practices.

### Changed
- **Documentation Overhaul**: Extensively rewrote `README.md` for better clarity, improved project overview, and detailed setup/development guidance.
- **Workflow Improvements**: Synchronized all documentation with the latest technology stack (React 19, Tailwind CSS 4, Vite 8).

## [2.2.8] - 2026-05-07

### Added
- **Enhanced Data Persistence**: Integrated `saveToIndex()` into the `ingestRestaurants` script to ensure that embedded restaurant data is persisted to disk immediately after ingestion.

### Changed
- **Model Alignment**: Upgraded the `classifyTrendRelevanceToProfile` skill to use the Reasoning Tier model (`gemini-1.5-pro`) as per the architectural specification.
- **Deduplication Strategy**: Updated restaurant ingestion to use a `name-neighborhood` keying strategy for deduplication, ensuring more robust record management.
- **Documentation Synchronization**: Updated `SKILLS.md` to perfectly align with the actual implementation's field names (camelCase) and schema definitions.

## [2.2.7] - 2026-05-07

### Added
- **Standardized Config Templates**: Updated `.env.example` and `.prettierrc` to follow professional industry standards.

### Fixed
- **Documentation Polish**: Standardized `AGENTS.md` and finalized all project guides to meet high-level technical documentation standards.

## [2.2.6] - 2026-05-07

### Added
- **Architecture Diagrams**: Integrated Mermaid.js diagrams into `DESIGN.md` for better system visualization.
- **Technical Specifications**: Converted `SKILLS.md` into a formal technical spec with detailed input/output schemas.

## [2.2.5] - 2026-05-07

### Added

- **Premium 'Culinary Gold' Redesign**: Overhauled the entire visual identity with a high-end dark mode theme, glassmorphism containers, and sophisticated Serif typography (Playfair Display).
- **Rationale Persistence (`whyMatch`)**: Enhanced the `scoreRestaurant` skill to generate a natural language rationale which is now preserved throughout the RAG re-ranking phase and displayed in the UI.

### Fixed

- **Missing `cn` Utility**: Implemented the missing `cn` class name merger in `utils.ts`, resolving runtime errors in the new UI components.
- **Type-Checking Coverage**: Updated `tsconfig.json` to explicitly include all source files, ensuring 100% type safety across the `src` directory.
- **Robustness Guards**: Added `cleanJson` sanitization to the Profile Builder parsing logic to handle malformed LLM outputs.

## [2.2.4] - 2026-05-07


### Fixed

- **Restaurant Duplication on Startup** (`VectorDb.ts`, `server.ts`): Converted `VectorDb.add` into an upsert operation and added an `isEmpty()` check in `server.ts` to prevent the ingestion script from duplicating restaurant records in the vector index upon every server restart.
- **Brittle JSON Parsing in Agents** (`finalizer.ts`, `trendAnalyst.ts`): Added robust try/catch blocks and `cleanJson` sanitization to recommendation finalization and trend extraction. This prevents the entire pipeline from crashing if an LLM response contains minor markdown formatting artifacts.
- **Inconsistent Skill Error Surfacing** (`extractCuisines.ts`, `analyzeFoodPhoto.ts`, `extractTrendsFromSearchResults.ts`, `classifyTrendRelevanceToProfile.ts`): Standardized all agent skills to throw `SkillError` with descriptive context during parsing failures, enabling the multi-agent orchestrator to provide more specific error messages to the user.
- **Vite Version Hallucination** (`README.md`, `DESIGN.md`): Corrected documentation references from "Vite 8" to the actual "Vite 6" used in the project's dependency manifest.

## [2.2.3] - 2026-05-07


### Changed

- **Comprehensive Documentation Hardening** (`AGENTS.md`, `SKILLS.md`, `DESIGN.md`): Synchronized all architecture and design documents with the current production baseline.
    - Updated tech stack versions (React 19, Vite 8, Motion 12).
    - Documented Model Selection Strategy (Dual-model Flash/Pro approach).
    - Codified internal skill resilience rules and structured error propagation.
    - Detailed the restaurant scoring heuristic weights and vector similarity integration.
    - Added security invariants and TypeScript development standards.

## [2.2.2] - 2026-05-07


### Fixed

- **Inconsistent Error Type in `generateEmbedding` Skill** (`generateEmbedding.ts`): When the API returned an empty embedding, the skill threw a plain `Error` rather than a `SkillError`, bypassing the structured error-handling chain and producing a non-user-friendly message. Restored the `SkillError('generateEmbedding', ...)` throw with a descriptive message (`'Empty embedding received from API'`) so failures surface correctly to callers and the API layer.

### Changed

- **README**: Updated technology stack table to reflect correct live model IDs (`gemini-2.0-flash`, `gemini-1.5-pro`) and clarified the High Resilience Architecture feature to mention `withRetry` and `SkillError` propagation explicitly.

## [2.2.1] - 2026-05-07

### Fixed

- **Invalid Model Names** (`profileBuilder.ts`, `ragRecommender.ts`, `trendAnalyst.ts`, `finalizer.ts`, `extractCuisines.ts`, `analyzeFoodPhoto.ts`, `extractTrendsFromSearchResults.ts`, `classifyTrendRelevanceToProfile.ts`): Replaced all references to non-existent model identifiers `gemini-3-flash-preview` and `gemini-3.1-pro-preview` with the correct, live model IDs `gemini-2.0-flash` and `gemini-1.5-pro` respectively. These bad identifiers would have caused every API call to fail at runtime with a model-not-found error.
- **Missing `withRetry` in Ingestion Script and Agent Skills** (`ingestRestaurants.ts`, `extractCuisines.ts`, `analyzeFoodPhoto.ts`, `generateEmbedding.ts`, `extractTrendsFromSearchResults.ts`, `classifyTrendRelevanceToProfile.ts`): Model calls were invoked directly without `withRetry`, violating the AGENTS.md resilience contract. Wrapped all internal `generateContent` and `embedContent` calls in `withRetry` to ensure application-wide resistance to transient `429` failures.
- **Missing `@types/better-sqlite3` Dev Dependency** (`package.json`): The `better-sqlite3` package was used in `cache.ts` but its TypeScript type definitions were absent from `devDependencies`, causing `tsc --noEmit` (`npm run lint`) to fail. Added `@types/better-sqlite3@^7.6.13`.
- **Incorrect `moduleResolution`** (`tsconfig.json`): `"moduleResolution": "node"` is incompatible with the project's ESM module system and the `.js`-extension import style used by `tsx` and Vite. Changed to `"moduleResolution": "bundler"`, which correctly resolves `.ts` source files referenced via `.js` extensions.
- **Permissive CORS Configuration** (`server.ts`): `app.use(cors())` allowed requests from any origin, violating the AGENTS.md security invariant requiring strict origin restriction. Replaced with an origin allowlist that permits only `localhost` origins and restricts methods to `GET` and `POST`.

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
