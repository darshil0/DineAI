# Changelog

All notable changes to this project will be documented in this file.

## [1.3.1] - 2026-03-19

### Fixed
- **Invalid Gemini Response Schema** (`src/skills/extractCuisines.ts`): The `responseSchema` was incorrectly defined with `Type.ARRAY` at the root level, which is unsupported by the Gemini API and caused an API error on every call. The schema has been corrected to use a root `Type.OBJECT` wrapping the array under a named `cuisines` property, with parsing updated accordingly.
- **Unsafe JSON Parsing in Trend Skills** (`src/skills/classifyTrendRelevanceToProfile.ts`, `src/skills/extractTrendsFromSearchResults.ts`): Both skills called `JSON.parse(response.text)` directly, without guarding against an `undefined` response or Gemini's occasional markdown fencing of JSON output. Both now use `cleanJson` with a typed null-safe fallback, eliminating the crash surface.
- **Missing Null Checks on Skill Registry Lookups** (`src/services/trendAnalyst.ts`): `getSkill()` returns `AgentSkill | undefined`, but `.run()` was called on both `extractTrendsFromSearchResults` and `classifyTrendRelevanceToProfile` without verifying the skills were registered. This guaranteed a `TypeError` at runtime if either skill was absent. Explicit null checks with descriptive error messages have been added.
- **Type Mismatch in Textarea Submit Handler** (`src/components/ChatInterface.tsx`): The `onKeyDown` handler on the textarea called `handleSubmit(e)`, passing a `React.KeyboardEvent` to a function typed to accept `React.FormEvent`. This also caused `e.preventDefault()` to be invoked on the wrong event type. The core submission logic has been extracted into a dedicated `submitMessage` callback, which both the form's `onSubmit` and the textarea's `onKeyDown` now invoke independently without event-type coercion.

---

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
