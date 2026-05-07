# Agent Skills Architecture

DineAI employs a modular agent skills architecture to compose and manage specialized capabilities. Each skill is a standalone, type-safe function that operates independently and can be registered and retrieved through a central registry. This design pattern enables flexible agent composition while maintaining strict type safety and consistent error handling across the system.

## Skill Interface & Registry

All skills must implement the `AgentSkill<TInput, TOutput>` interface, which defines a name, description, and an asynchronous run function. The skill registry provides two primary operations: `registerSkill(skill: AgentSkill)` registers a new skill during the bootstrap phase, and `getSkill<TInput, TOutput>(name: string)` retrieves a registered skill by name with full type safety. This registry pattern allows agents to dynamically discover and execute skills without tight coupling to specific implementations.

## Resilience & Error Handling

All interactions with the Gemini API—including embeddings generation, vision analysis, search queries, and chat completions—must be wrapped in the `withRetry` utility from `src/lib/utils.ts`. This utility implements exponential backoff logic beginning at one second and doubling with each attempt, up to a maximum of eight seconds, with a default of three retry attempts. This approach gracefully handles transient failures such as rate-limit errors (HTTP 429) that would otherwise cause the skill to fail immediately.

```typescript
import { withRetry } from '../lib/utils.js';
import { getSkill } from '../skills/registry.js';

const skill = getSkill('mySkill');
const result = await withRetry(() => skill.run(input));
```

Skills should catch internal errors and throw descriptive `SkillError` instances defined in `src/lib/errors.ts`. The calling agent service will handle these errors to provide graceful degradation and informative logging. This error boundary pattern ensures that failures in individual skills do not cascade and compromise the entire recommendation pipeline.

## Core Skills Reference

The DineAI system includes six core skills that power the recommendation pipeline:

**analyzeFoodPhoto** leverages Gemini Vision to infer cuisine preferences and ambiance cues from user-uploaded food images. The skill accepts an image buffer and returns structured cuisine and ambiance data that enriches the user taste profile.

**extractCuisines** parses natural language input to identify and structure cuisine preferences. This skill accepts user messages and returns a list of cuisine names that can be integrated into the user profile.

**generateEmbedding** produces vector embeddings for restaurants and search queries using the Gemini Embedding 2 model. These embeddings enable semantic similarity calculations that power the RAG recommender's retrieval phase.

**scoreRestaurant** computes a personalized match score between a user taste profile and a candidate restaurant. The skill employs a normalized heuristic blend with fixed weights: Cuisine (0.4), Price (0.3), Ambiance (0.2), and Dietary (0.1). When vector similarity scores are available, the skill returns a 50/50 blend of the similarity score and the heuristic score to balance semantic relevance with profile alignment. This dual-scoring approach ensures recommendations reflect both semantic preference matches and structured profile alignment.

**extractTrendsFromSearchResults** parses raw search results from Google Search into structured food trends. The skill accepts search response data and returns categorized trending cuisines, emerging restaurants, and viral dishes.

**classifyTrendRelevanceToProfile** determines which identified trends align with a specific user taste profile. This skill accepts trend data and a user profile, returning a relevance score and rationale for each trend. This enables the Trend Analyst agent to surface only those trends that genuinely match user preferences rather than flooding recommendations with generic popular items.

All skills follow consistent patterns for input validation, error handling, and output type safety. When extending the skill registry with new capabilities, maintain these patterns to ensure compatibility with the broader agent orchestration system and preserve the reliability guarantees that underpin the recommendation pipeline.
