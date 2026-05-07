# Agent Skills Architecture

DineAI uses a modular **Agent Skills** architecture to compose agent capabilities. Each skill is a standalone, typed function that can be registered and retrieved via a central registry.

## Skill Interface

All skills must implement the `AgentSkill<TInput, TOutput>` interface:

```typescript
export interface AgentSkill<TInput, TOutput> {
  name: string;
  description: string;
  run: (input: TInput) => Promise<TOutput>;
}
```

## Skill Registry

Skills are registered during the bootstrap phase and can be retrieved by name:

- `registerSkill(skill: AgentSkill)`: Registers a new skill.
- `getSkill<TInput, TOutput>(name: string)`: Retrieves a registered skill by name with type safety.

## Best Practices

### 1. Resilience with `withRetry`

Due to potential transient errors (like `429 Too Many Requests`), **all interactions with the Gemini API (Embeddings, Vision, Search, and Chat) MUST be wrapped in the `withRetry` utility** to ensure robustness through exponential backoff.

```typescript
import { withRetry } from '../lib/utils.js';
import { getSkill } from '../skills/registry.js';

const skill = getSkill('mySkill');
const result = await withRetry(() => skill.run(input));
```

### 2. Error Handling

Skills should catch internal errors and throw descriptive `SkillError` instances. The calling agent will handle these errors to provide graceful degradation.

## Core Skills

1. **analyzeFoodPhoto**: Uses Gemini Vision to infer cuisines and ambiance from an image.
2. **extractCuisines**: Extracts structured cuisine names from user text.
3. **generateEmbedding**: Generates vector embeddings for restaurants or search queries.
4. **scoreRestaurant**: Computes a personalized match score between a user profile and a restaurant. It uses a normalized heuristic blend (Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1). If vector similarity is provided, it returns a 50/50 blend of similarity and heuristics.
5. **extractTrendsFromSearchResults**: Parses raw search data into structured food trends.
6. **classifyTrendRelevanceToProfile**: Determines which trends align with a specific user taste profile.
