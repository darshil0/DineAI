# Changelog

All notable changes to this project will be documented in this file.

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
