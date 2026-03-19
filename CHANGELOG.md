# Changelog

All notable changes to this project will be documented in this file.

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
