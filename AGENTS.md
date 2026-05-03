# Agent Development Guide

This document outlines the architectural patterns, critical constraints, and development standards for the DineAI application.

## 🤖 Multi-Agent Orchestration

The application uses a sequential pipeline of specialized agents:
1.  **Profile Builder**: Generates `UserTasteProfile` from history and images.
2.  **RAG Recommender**: Performs vector search and LLM filtering.
3.  **Trend Analyst**: Uses Google Search grounding for real-time trends.
4.  **Finalizer**: Synthesizes profile, candidates, and trends into ranked recommendations.

## 🛡️ Reliability & Resilience

- **API Retry Logic**: All model calls and skill executions must be wrapped in `withRetry` from `src/lib/utils.ts` to handle `429` errors.
- **Prompt Serialization**: Always `JSON.stringify` state objects in prompts to avoid `[object Object]` interpolation issues.
- **Embeddings Cache**: `embeddings_cache.db` is a persistent SQLite cache used to minimize API costs and latency during ingestion. This file is tracked in the repository.

## 🎨 Frontend & UX Patterns

- **Skeleton Loading**: Use `loading` props on `TasteProfileBadge` and `RecommendationCard` during agent processing.
- **Stability**: Hoist initial state functions (like `setInitialMessage`) and wrap in `useCallback` to prevent unnecessary re-renders.
- **Feedback Loop**: "Like"/"Dislike" feedback is used to refine `disliked_cuisines` and `avoid_patterns` in the profile.

## 🛡️ Security & Cleanup Rules

- **Key Isolation**: RESTRICT all API keys to `server.ts`. Never expose keys to the client.
- **Context Poisoning**: History is truncated to the last 10 exchanges; assistant roles are strictly validated.
- **Cleanup Rules**:
  - Remove truly unused, redundant, or obsolete files.
  - Keep `embeddings_cache.db` (pre-computed infrastructure).
  - Ignore `vector_index.json` (runtime artifact).
  - Always run `npx prettier --write .` after modifications.

## 🧪 Testing

Run built-in tests to ensure stability:
```bash
npm run lint
npm test
```
