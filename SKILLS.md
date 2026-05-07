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
Due to potential transient errors (like `429 Too Many Requests`) when skills interact with the Gemini API, **all skill executions MUST be wrapped in the `withRetry` utility**.

```typescript
import { withRetry } from '../lib/utils.js';
import { getSkill } from '../skills/registry.js';

const skill = getSkill('mySkill');
const result = await withRetry(() => skill.run(input));
```

### 2. Internal Skill Resilience
In addition to the caller-side retry, **all internal `generateContent` and `embedContent` calls within a skill's `run` method must be wrapped in `withRetry`**. This ensures that even if a skill is used in a context without a wrapper, it remains robust against transient API failures.

### 3. Error Handling & Structured Output
Skills must:
- Use `SkillError` for all known failure modes.
- Implement strict JSON output validation via `Type` schemas and `cleanJson` utility to ensure the returned data matches the expected interface.

## Core Skills

1. **analyzeFoodPhoto**: Uses Gemini Vision (`gemini-2.0-flash`) to infer cuisines and ambiance from an image.
2. **extractCuisines**: Extracts structured cuisine names from user text using strict JSON schemas.
3. **generateEmbedding**: Generates vector embeddings using `gemini-embedding-2-preview`. Crucial for semantic search accuracy.
4. **scoreRestaurant**: A business-logic skill that computes a personalized match score (0.0 to 1.0) using weighted heuristics (Cuisine: 0.4, Price: 0.3, Ambiance: 0.2, Dietary: 0.1) combined with vector similarity.
5. **extractTrendsFromSearchResults**: Parses raw Google Search snippets into structured trending cuisines, openings, and viral dishes.
6. **classifyTrendRelevanceToProfile**: Compares a `UserTasteProfile` against trends to determine relevance scores and rationale.
