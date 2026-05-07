# Agent Development Guide

This document outlines the architectural patterns, critical constraints, and development standards for the DineAI application. All contributors must adhere to these specifications to maintain system reliability, security, and consistency.

## Agent Architecture

DineAI employs a sequential multi-agent pipeline where each agent specializes in a distinct aspect of the recommendation process. The Profile Builder extracts user preferences from conversation history and uploaded food images to construct a `UserTasteProfile`. The RAG Recommender performs semantic vector search against the restaurant database and applies LLM-based filtering to surface candidates. The Trend Analyst queries live data through Google Search integration to identify emerging dining trends and new local openings. Finally, the Finalizer synthesizes outputs from all previous agents—combining the user profile, candidate restaurants, and trend insights—into a ranked set of recommendations delivered to the user.

## Technical Requirements & Constraints

### API Integration & Resilience

All Gemini API calls and skill executions must be wrapped using the `withRetry` utility from `src/lib/utils.ts`. This wrapper implements exponential backoff logic to gracefully handle rate-limit responses (HTTP 429) rather than failing immediately. When serializing state objects into prompts, always use `JSON.stringify` to prevent unintended `[object Object]` interpolation that can corrupt instruction clarity.

### Module & Multimodal Compliance

TypeScript ESM compliance requires all imports within the `src/` directory to include the `.js` file extension (e.g., `import { X } from './Y.js'`). This satisfies Node.js ESM resolution requirements. When constructing Gemini API requests that combine text and image inputs, use a single interaction turn structure where `contents` is an array of objects and `systemInstruction` is an object with a `parts` property (e.g., `{ parts: [{ text: '...' }] }`).

### Data Model Standards

Restaurant objects must use the property `cuisine` rather than `cuisine_type`, and include a `tags` array for semantic categorization. Google Search integration requires the `googleSearchRetrieval` tool configuration with a `dynamicRetrievalConfig` setting (e.g., `mode: 'MODE_DYNAMIC'`) to enable real-time retrieval.

### Caching & Storage

The `embeddings_cache.db` file is a persistent SQLite cache that minimizes API costs and latency during restaurant ingestion. This file is version-controlled and must be retained. The `vector_index.json` file is a runtime artifact generated during execution and should be excluded from version control.

## Frontend Implementation

The frontend is built with React 19, Vite 7, and Tailwind CSS v4, with custom theme variables defined in `src/index.css` using the `@theme` block. During agent processing, use the `loading` prop on both `TasteProfileBadge` and `RecommendationCard` components to provide visual feedback to users. State functions such as `setInitialMessage` should be hoisted and wrapped in `useCallback` to prevent unnecessary re-renders. The feedback mechanism—"Like" and "Dislike" buttons—refines the user profile by updating `disliked_cuisines` and `avoid_patterns` attributes based on user selections.

## Security & Error Handling

Skill-level errors must be wrapped in `SkillError` and service-level errors in `AgentServiceError`, both defined in `src/lib/errors.ts`, to ensure consistent error propagation and debugging. All API keys must be isolated to `server.ts` and never exposed to client-side code. Chat history validation enforces strict role alternation between `user` and `assistant` messages, and history must not end with a `user` message to prevent role-conflict attacks. To mitigate context poisoning, history is automatically truncated to the last 10 exchanges.

Maintain root directory hygiene by removing unused files such as `metadata.json` or logic that has been refactored into the `src/` directory. Always run `npx prettier --write .` after modifications to maintain consistent code formatting.

## Quality Assurance

Run the following commands to validate system stability:

```bash
npm run lint
npm test
npm run verify
```

These commands perform linting checks, execute unit tests, and run end-to-end system verification to ensure all agents and skills function correctly.
