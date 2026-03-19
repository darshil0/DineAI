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

## Core Skills

1. **analyzeFoodPhoto**: Uses Gemini Vision to infer cuisines and ambiance from an image.
2. **extractCuisines**: Extracts structured cuisine names from user text.
3. **generateEmbedding**: Generates vector embeddings for restaurants or search queries.
4. **scoreRestaurant**: Computes a personalized match score between a user profile and a restaurant.
5. **extractTrendsFromSearchResults**: Parses raw search data into structured food trends.
6. **classifyTrendRelevanceToProfile**: Determines which trends align with a specific user taste profile.
