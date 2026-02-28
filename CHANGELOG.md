# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-02-28

### Added

- **`src/lib/logger.ts`** — New structured logging utility. All log output now follows the format `[TIMESTAMP] [LEVEL] [MODULE] message`. Replaced all bare `console.log` / `console.error` calls across agents, services, and scripts.
- **`src/lib/utils.test.ts`** — Unit tests for the `cleanJson` helper covering standard backtick fences, `\`\`\`json` fences, trailing-newline edge cases, and plain JSON strings.
- **`scripts/reset-db.ts`** — Documentation script explaining that the Vector DB is in-memory and restarting the server is the only way to clear its state.

### Fixed

- **Ingestion partial-failure state** (`ingestRestaurants.ts`) — Successful embedding records are now collected first and only upserted as a batch if at least one succeeded. Previously, a mid-loop failure left the DB empty on the next startup, causing ingestion to re-run and fail again.
- **RAG similarity threshold** (`ragRecommender.ts`) — Added a minimum cosine similarity threshold of `0.1`. Results below this are discarded before `scoreRestaurant` runs, preventing unrelated restaurants from receiving an inflated match score via the cuisine/price/ambiance bonuses.
- **Trend Analyst part filtering** (`trendAnalyst.ts`) — Added an explicit guard for non-text part types (`executableCode`, `codeExecutionResult`) in the Gemini response. The filter is now intentional and documented rather than relying on silent nullish coalescing.
- **Score weight normalization** (`scoreRestaurant.ts`) — Weights are now normalized so that a full heuristic match (cuisine + price + ambiance + dietary) reaches `1.0` even when no vector similarity score is provided. Previously, the maximum without a similarity input was `0.5`.
- **Empty profile detection** (`profileBuilder.ts`) — Added a post-parse check that throws a descriptive error if the Gemini response produces an empty `{}` profile, preventing the RAG and Finalizer agents from receiving a profile with no fields and returning generic results.
- **Startup API key check** (`server.ts`) — `getGeminiClient()` is now called before `app.listen()`. If `GEMINI_API_KEY` is missing or invalid, the process exits immediately with a clear error instead of appearing to start successfully and failing on the first request.
- **`cleanJson` edge case** (`src/lib/utils.ts`) — Fixed handling of triple backticks without a trailing newline before the closing fence. The prior implementation only stripped the closing `` ``` `` when it appeared at the exact end of the trimmed string, missing cases introduced by certain Gemini response formats.
- **Frontend timer leaks** (`ChatInterface.tsx`) — `setTimeout` IDs for loading-step updates are now stored and cleared in the `finally` block, preventing state updates on unmounted components when a request completes or errors before a timer fires.
- **Error stack traces** (all agents) — Re-thrown errors now use `new Error(message, { cause: originalError })` instead of `new Error(message)`, preserving the original stack trace for Node 18+ debugging.

### Changed

- **Input validation** (`src/api/chat.ts`) — Added `zod` validation for `message`, `history`, and `currentProfile` at the route boundary. Malformed or missing fields now return a `400` response before reaching any agent.
- **Conversation history truncation** (`src/api/chat.ts`) — History passed to the Profile Builder Agent is now capped at the last 6 messages, preventing unbounded token usage during long conversations.
- **Concurrent ingestion batching** (`ingestRestaurants.ts`) — Restaurants are now embedded in concurrent batches of 5 with a 200ms delay between batches, reducing first-startup ingestion time by approximately 5×. Each batch also retries up to 3 times with exponential backoff on transient API failures.
- **Vector DB pre-normalization** (`src/lib/vectorDb.ts`) — Embeddings are normalized on `upsert` so that query time requires only a dot product, eliminating per-query norm computation. Cosine similarity is preserved by construction.
- **Model name constant** (`src/lib/geminiClient.ts`) — `"gemini-2.0-flash"` is now exported as `GEMINI_MODEL` and referenced from all six agent and skill files. Previously hard-coded in each file independently.
- **Express 5 async error handling** (`src/api/chat.ts`, `server.ts`) — Removed the per-route `try/catch` block in the chat route in favor of Express 5's automatic async error forwarding. A global error handler is now registered in `server.ts`.
- **Named re-exports** (`src/schemas/index.ts`) — Switched from `export *` to explicit named re-exports for `UserTasteProfile`, `UserTasteProfileSchema`, `Recommendation`, and `FinalRecommendationsSchema`.
- **Package scripts** (`package.json`) — `lint` now runs `eslint src/`; TypeScript type-checking is exposed separately as `typecheck` (`tsc --noEmit`).
- **Environment file naming** — `.env.example` renamed to `.env.local.example` to match the `cp` command documented in the README.
- **Dependencies updated to latest stable:**

  | Package | From | To | Notes |
  |---|---|---|---|
  | `express` | `^4.21.2` | `^5.2.1` | Migrated to Express 5 async error handling |
  | `@types/express` | `^4.17.21` | `^5.0.x` | Matched to Express 5 |
  | `vite` | `^6.2.0` | `^7.3.1` | |
  | `react` / `react-dom` | `^19.0.0` | `^19.2.4` | |
  | `tailwindcss` / `@tailwindcss/vite` | `^4.1.14` | `^4.2.1` | |
  | `lucide-react` | `^0.546.0` | `^0.575.0` | |
  | `dotenv` | `^17.2.3` | `^17.3.1` | |
  | `zod` | — | `^3.24.2` | New dependency for API input validation |

---

## [1.2.2] - 2026-02-28

### Fixed

- **Environment loading** (`server.ts`) — Server now loads `.env.local` first and falls back to `.env`, matching the setup instructions in the README. Previously only `.env` was loaded by default, causing `GEMINI_API_KEY` to be silently undefined in local development.
- **`vite.config.ts` ESM compatibility** — `__dirname` is undefined in ESM projects (`"type": "module"` in `package.json`). Fixed by deriving it from `import.meta.url` via `fileURLToPath`.
- **`package.json` start script** — Changed `"start": "node server.ts"` to `"start": "tsx server.ts"` since Node cannot execute TypeScript directly.
- **`@google/genai` version** — Bumped from `^1.29.0` to `^1.43.0` to match the SDK version required by the `systemInstruction` object/parts syntax used throughout the codebase.
- **Fallback RAG response schema** — Added a `responseSchema` to the LLM fallback path in `ragRecommender.ts`. Without it the model could return a wrapped object or prose string, causing downstream JSON parse failures.
- **Ingestion rate limiting** (`ingestRestaurants.ts`) — Added a 200ms sleep between sequential embedding calls to avoid burst rate-limit rejections across 120 restaurants.
- **Trend Analyst multi-part response** (`trendAnalyst.ts`) — Changed `parts[0].text` to `parts.map(p => p.text).join("")` so the full text is captured when Google Search grounding returns multiple parts.
- **Removed unused dependency** — Removed `better-sqlite3` from `package.json`; it was listed as a dependency but never imported anywhere in the codebase.

### Changed

- **`README.md` overhaul** — Rewritten to include the DineAI project name, feature descriptions, verified tech stack, and corrected setup instructions.

---

## [1.2.1] - 2026-02-27

### Fixed

- Resolved TypeScript linting errors in `src/scripts/ingestRestaurants.ts` by updating property access to use `tags` instead of non-existent `ambiance` and `dietary_options`.
- Fixed runtime issues by updating model names to `gemini-2.0-flash` across all services and skills.
- Correctly implemented `@google/genai` (SDK 1.43.0) syntax for `generateContent`, ensuring `systemInstruction` and `contents` follow the required object/array structures.
- Fixed response parsing to correctly access `candidates[0].content.parts[0].text`.

### Changed

- Updated `PRD.md` to reflect the current state of the LLM backend (Gemini 2.0 Flash).
- Formatted the entire codebase using Prettier for consistency.
