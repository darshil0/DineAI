# Changelog

## [Unreleased]
### Fixed
- **Dependency Management**: Downgraded `vite` to `^7.3.2` to resolve peer dependency conflicts with `@tailwindcss/vite`.
- **Scoring Engine**: Normalized weights in `scoreRestaurant.ts` (Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1). Removed unused neighborhood weights.
- **Environment**: Restored `npm run lint` and `npm test` stability.

### Changed
- **Code Quality**: Applied project-wide formatting via Prettier and Tailwind CSS plugin.

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
