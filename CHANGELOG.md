# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-02-28

### Fixed
- **Ingestion Failure Handling**: Updated `ingestRestaurants.ts` to collect successful records and only upsert if at least one succeeded, preventing broken DB states.
- **RAG Recommender Accuracy**: Added a minimum similarity threshold (0.1) in `ragRecommender.ts` to filter out unrelated restaurants.
- **Trend Guardrails**: Explicitly filtered for text parts in `trendAnalyst.ts` response to guard against non-text parts.
- **Scoring Normalization**: Normalized weights in `scoreRestaurant.ts` so that full heuristic matches reach 1.0.
- **Empty Profile Check**: Added validation in `profileBuilder.ts` to throw an error if the generated profile is empty.
- **Startup Integrity**: Added `GEMINI_API_KEY` validation in `server.ts` before server startup.
- **JSON Parsing**: Fixed `cleanJson` in `utils.ts` to handle varied markdown formatting.
- **Memory Management**: Fixed potential timer leaks in `ChatInterface.tsx` by properly storing and clearing timer IDs.

### Changed
- **Input Validation**: Added server-side `zod` validation for chat messages, history, and profiles in `chat.ts`.
- **Performance Optimization**: Refactored ingestion into concurrent batches (5 restaurants per batch) and optimized Vector DB with pre-normalization and dot product search.
- **Token Efficiency**: Truncated conversation history to the last 6 messages in `chat.ts`.
- **Maintainability**: Extracted `GEMINI_MODEL` constant and switched to named re-exports in `schemas/index.ts`.
- **Observability**: Implemented a structured `logger.ts` and replaced all bare `console` calls.
- **Express 5 Migration**: Updated `chat.ts` to leverage Express 5's automatic async error forwarding and added a global error handler in `server.ts`.
- **Stable Dependencies**: Updated all packages to latest stable versions (Vite 7.3.1, Express 5.2.1, React 19.2.4).

### Added
- `src/lib/utils.test.ts`: Unit tests for JSON cleaning utility.
- `src/lib/logger.ts`: New structured logging utility.
- `scripts/reset-db.ts`: Documentation script for DB reset behavior.

## [1.3.0] - 2026-02-28

### Added
- `src/lib/logger.ts`: New structured logging utility replacing bare `console` calls.
- `src/lib/utils.test.ts`: Unit tests for JSON cleaning utility.
- `scripts/reset-db.ts`: Script documenting Vector DB reset behavior.

### Fixed
- **Ingestion Reliability**: Improved `ingestRestaurants.ts` to collect successful records and only upsert if at least one succeeded, preventing broken DB states.
- **RAG Accuracy**: Added a minimum similarity threshold (0.1) in `ragRecommender.ts` to filter out unrelated restaurants early.
- **Trend Guardrails**: Added explicit part-type filtering in `trendAnalyst.ts` to handle non-text response parts from Gemini.
- **Scoring Normalization**: Re-normalized weights in `scoreRestaurant.ts` so that full heuristic matches can reach 1.0 even without vector similarity.
- **Profile Validation**: Added an empty-profile check in `profileBuilder.ts` to prevent silent failures with generic recommendations.
- **Startup Reliability**: Added `GEMINI_API_KEY` validation at server startup in `server.ts`.
- **JSON Parsing**: Fixed `cleanJson` in `src/lib/utils.ts` to handle triple backticks without trailing newlines.
- **Memory Leaks**: Fixed potential timer leaks in `ChatInterface.tsx` by properly storing and clearing timer IDs.

### Changed
- **API Security**: Added `zod` validation for `message`, `history`, and `currentProfile` in the chat endpoint.
- **Efficiency**: Refactored `ingestRestaurants.ts` for concurrent batch processing (batches of 5), reducing startup time.
- **Performance**: Optimized Vector DB by pre-normalizing embeddings on upsert and using dot product search for queries.
- **Token Optimization**: Truncated conversation history to the last 6 messages in `chat.ts` before passing to agents.
- **Maintainability**: Extracted `GEMINI_MODEL` constant to `src/lib/geminiClient.ts` and updated all agents/skills.
- **Code Quality**: Switched to named re-exports in `src/schemas/index.ts` and improved error re-throwing with the `cause` property.
- **Dependencies**: Updated all packages to latest stable versions:
  - `express`: `^4.21.2` -> `^5.2.1` (Migrated to Express 5 async error handling)
  - `vite`: `^6.2.0` -> `^7.3.1`
  - `react`/`react-dom`: `^19.0.0` -> `^19.2.4`
  - `@tailwindcss/vite`/`tailwindcss`: `^4.1.14` -> `^4.2.1`
  - `lucide-react`: `^0.546.0` -> `^0.575.0`
  - `dotenv`: `^17.2.3` -> `^17.3.1`
  - `zod`: Added `^3.24.2`

## [1.2.2] - 2026-02-28

### Changed

- **README Overhaul:** Completely rewritten `README.md` to include DineAI project name, comprehensive feature list from PRD, and verified technology stack (React, Tailwind, Express, Gemini 2.0 Flash).
- **Documentation:** Updated project documentation to reflect current architecture and capabilities.

### Fixed

- **Environment Support:** Updated `server.ts` to prioritize loading environment variables from `.env.local` as instructed in the README, while maintaining `.env` as a fallback.

## [1.2.1] - 2026-02-27

### Fixed

- Resolved TypeScript linting errors in `src/scripts/ingestRestaurants.ts` by updating property access to use `tags` instead of non-existent `ambiance` and `dietary_options`.
- Fixed runtime issues by updating model names to `gemini-2.0-flash` across all services and skills.
- Correctly implemented `@google/genai` (SDK 1.43.0) syntax for `generateContent`, ensuring `systemInstruction` and `contents` follow the required object/array structures.
- Fixed response parsing to correctly access `candidates[0].content.parts[0].text`.

### Changed

- Updated `PRD.md` to reflect the current state of the LLM backend (Gemini 2.0 Flash).
- Formatted the entire codebase using Prettier for consistency.
