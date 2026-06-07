# Agent Skills: Technical Specification

This document is the authoritative technical reference for DineAI's modular **Agent Skills** architecture. Each skill is a composable, independently testable TypeScript function registered at startup and consumed by agents via the skill registry.

**Current version: 2.3.0** — see [CHANGELOG.md](./CHANGELOG.md) for revision history.

---

## 🧱 Core Interfaces

### `AgentSkill<Input, Output>`

All skills implement this interface, defined in `src/skills/types.ts`:

```typescript
interface AgentSkill<Input, Output> {
  name: string;
  description: string;
  run: (input: Input) => Promise<Output>;
}
```

### `RestaurantCandidate`

Introduced in v2.3.0. Exported from `src/services/ragRecommender.ts` and used as the return type of `recommendCandidates()` and the input type of `finalizeRecommendations()`:

```typescript
type RestaurantCandidate = Restaurant & {
  match_score?: number;   // computed by scoreRestaurant
  whyMatch?: string;      // human-readable heuristic rationale
};
```

This type ensures that the heuristic rationale computed by `scoreRestaurant` flows through the full pipeline to the Finalizer prompt and the `RecommendationCard` UI component.

---

## 🗂️ Skill Registry

The registry (`src/skills/registry.ts`) is a `Map`-backed singleton. All skills must be registered at startup via `bootstrapSkills()` before any agent can use them.

```typescript
// Register a skill
registerSkill(skill: AgentSkill<Input, Output>): void

// Retrieve a skill by name (returns undefined if not found)
getSkill<Input, Output>(name: string): AgentSkill<Input, Output> | undefined

// List all registered skill names
listSkills(): string[]
```

**Registration order** (`src/skills/bootstrap.ts`):
1. `extractCuisines`
2. `analyzeFoodPhoto`
3. `generateEmbedding`
4. `scoreRestaurant`
5. `extractTrendsFromSearchResults`
6. `classifyTrendRelevanceToProfile`

---

## 🛠️ Skills Catalog

### 1. `extractCuisines`

**Purpose**: Parses unstructured user text to identify specific, canonical cuisine names.

| Field | Value |
| :--- | :--- |
| **File** | `src/skills/extractCuisines.ts` |
| **Model** | `gemini-2.0-flash` |
| **Strategy** | Zero-shot extraction with Gemini Structured Outputs |

**Input**
```typescript
{ text: string }
```

**Output**
```typescript
{ cuisines: string[] }
```

**Behaviour**
- Returns `{ cuisines: [] }` when no cuisines are found — does **not** throw.
- Throws `SkillError('extractCuisines', cause)` on JSON parse failure.
- Called with `withRetry` by `profileBuilder.ts` before being caught as a `SkillError`.

---

### 2. `analyzeFoodPhoto`

**Purpose**: Multimodal analysis of a dining photo to infer food categories and restaurant ambiance.

| Field | Value |
| :--- | :--- |
| **File** | `src/skills/analyzeFoodPhoto.ts` |
| **Model** | `gemini-2.0-flash` (Vision) |
| **Strategy** | Inline image data + structured output prompt |

**Input**
```typescript
{
  mimeType: string;   // e.g. "image/jpeg" — one of jpeg, png, webp, gif
  data: string;       // base64-encoded image bytes
}
```

**Output**
```typescript
{
  cuisines: string[];    // inferred cuisine types
  ambiance: string[];    // inferred vibe, e.g. ["casual", "cozy"]
  description: string;   // one-sentence dish description
}
```

**Behaviour**
- Throws `SkillError('analyzeFoodPhoto', cause)` on parse failure.
- Only invoked when an image file is present in the request; skipped silently otherwise.

---

### 3. `generateEmbedding`

**Purpose**: Generates a high-dimensional vector representation of a text string for semantic search.

| Field | Value |
| :--- | :--- |
| **File** | `src/skills/generateEmbedding.ts` |
| **Model** | `gemini-embedding-2-preview` |
| **Dimensions** | 768 |

**Input**
```typescript
{ text: string }
```

**Output**
```typescript
{ embedding: number[] }   // length 768, normalised by LocalVectorDB before storage
```

**Behaviour**
- Throws `SkillError('generateEmbedding', 'Empty embedding received from API')` if the API returns an empty or missing `values` array.
- Used by both `ingestRestaurants.ts` (offline, with SQLite cache) and `ragRecommender.ts` (online, per query).
- The embedding cache (`embeddings_cache.db`) is keyed by `name-neighborhood` slug to avoid redundant API calls on restart.

---

### 4. `scoreRestaurant`

**Purpose**: A deterministic heuristic engine that computes a normalised match score and a human-readable rationale for a restaurant against a user taste profile.

| Field | Value |
| :--- | :--- |
| **File** | `src/skills/scoreRestaurant.ts` |
| **Model** | None — fully deterministic |
| **Test** | `src/skills/__tests__/scoreRestaurant.test.ts` |

**Input**
```typescript
{
  profile: UserTasteProfile;
  restaurant: Restaurant;
  similarity?: number;   // cosine similarity from LocalVectorDB, range [0, 1]
}
```

**Output**
```typescript
{
  matchScore: number;   // clamped to [0.0, 1.0]
  rationale: string;    // natural-language explanation of contributing factors
}
```

**Scoring — without `similarity`** (pure heuristic mode)

| Signal | Weight | Condition |
| :--- | :--- | :--- |
| Cuisine match | `+0.4` | Profile cuisine matches restaurant cuisine (case-insensitive) |
| Price — exact | `+0.3` | `profile.price_range === restaurant.price_tier` |
| Price — adjacent | `+0.15` | Price tier differs by 1 level |
| Price — far off | `−0.2` | Price tier differs by 3+ levels |
| Ambiance overlap | `+0.2` | Any profile ambiance value found in restaurant tags |
| Neighborhood match | `+0.2` | Profile neighborhood matches restaurant neighborhood (case-insensitive) |
| Dietary compatibility | `+0.1` | Dietary note found in restaurant tags (substring match) |

Maximum raw score: **1.2** → clamped to **1.0**.

**Scoring — with `similarity`** (vector + heuristic hybrid mode)

| Signal | Weight | Condition |
| :--- | :--- | :--- |
| Vector similarity | `sim × 0.5` | Base semantic score |
| Cuisine match | `+0.3` | Profile cuisine matches restaurant cuisine |
| Price — exact | `+0.2` | Exact price tier match |
| Price — adjacent | `+0.1` | Price tier differs by 1 level |
| Price — far off | `−0.2` | Price tier differs by 3+ levels |
| Ambiance overlap | `+0.2` | Any profile ambiance in restaurant tags |
| Neighborhood match | `+0.2` | Neighborhood match |
| Dietary compatibility | `+0.1` | Dietary note in restaurant tags |

Maximum raw score: **1.5** (at sim=1.0 with all heuristics matching) → clamped to **1.0**.

**Behaviour**
- Always returns a valid `{ matchScore, rationale }` — never throws.
- `rationale` is a period-joined list of natural-language reasons (e.g. `"Matches your craving for Italian. Fits your preferred price point perfectly."`). Falls back to `"A general match for your profile."` when no signals fire.
- Score is computed with `Math.max(0, Math.min(1, score))` before return.

---

### 5. `extractTrendsFromSearchResults`

**Purpose**: Synthesises raw Google Search output into a structured set of culinary trends for a given city.

| Field | Value |
| :--- | :--- |
| **File** | `src/skills/extractTrendsFromSearchResults.ts` |
| **Model** | `gemini-2.0-flash` |

**Input**
```typescript
{
  searchResults: string;   // raw text from Google Search grounding response
  city: string;            // e.g. "New York City"
}
```

**Output**
```typescript
{
  trendingCuisines: string[];   // cuisines gaining visible momentum
  newOpenings: string[];         // recently opened restaurants mentioned in results
  viralDishes: string[];         // specific dishes people are talking about
  summary: string;               // one-paragraph overview of the current food scene
}
```

**Behaviour**
- Returns empty arrays for any category when the search results contain insufficient signal — does **not** hallucinate trends.
- Throws `SkillError('extractTrendsFromSearchResults', cause)` on parse failure.
- Called inside `trendAnalyst.ts` after the Google Search grounding call, with `withRetry` wrapping applied externally.

---

### 6. `classifyTrendRelevanceToProfile`

**Purpose**: Evaluates which subset of current food trends a specific user would actually care about, and scores overall relevance.

| Field | Value |
| :--- | :--- |
| **File** | `src/skills/classifyTrendRelevanceToProfile.ts` |
| **Model** | `gemini-2.5-pro-preview-05-06` |

**Input**
```typescript
{
  profile: UserTasteProfile;
  trends: {
    trendingCuisines: string[];
    newOpenings: string[];
    viralDishes: string[];
  };
}
```

**Output**
```typescript
{
  relevantCuisines: string[];     // subset of trendingCuisines that match the profile
  relevantOpenings: string[];     // subset of newOpenings that match the profile
  relevantDishes: string[];       // subset of viralDishes that match the profile
  overallRelevanceScore: number;  // [0.0, 1.0] — how well trends align with this profile
  rationale: string;              // explanation of why these trends are relevant
}
```

**Behaviour**
- Returns empty arrays (not nulls) when no trends match the profile.
- `overallRelevanceScore` is rendered in the trend report as a percentage (e.g. `42%`).
- Throws `SkillError('classifyTrendRelevanceToProfile', cause)` on parse failure.
- Uses the Reasoning Tier model because accurate relevance classification requires cross-referencing multiple profile dimensions simultaneously.

---

## 🛡️ Error Handling

All skills use `SkillError` from `src/lib/errors.ts` for terminal failures:

```typescript
// Constructor signature
new SkillError(skillName: string, originalError: any)

// Properties
error.message              // "Skill [extractCuisines] failed: ..."
error.userFriendlyMessage  // "A specialized tool (extractCuisines) failed to complete its task."
error.statusCode           // 500
```

**Three-tier error contract:**

1. **Transient failures** (`429`, `5xx`, network errors) — handled by `withRetry` wrapping at the call site, **not** inside the skill. The `.catch()` converting to `SkillError` must be placed *outside* the `withRetry` callback so retries can fire before the error is reclassified.

2. **Terminal failures** (persistent API error, parse failure) — skill throws `SkillError` with full context.

3. **Empty results** — skills return a valid empty response (e.g. `{ cuisines: [] }`) rather than throwing. This applies to `extractCuisines` and all three trend skills when no data is found.

**Correct wrapping pattern** (from `profileBuilder.ts`):

```typescript
// ✅ Correct — withRetry fires before SkillError conversion
withRetry(() => skill.run(input)).catch((e) => {
  throw new SkillError('skillName', e);
});

// ❌ Wrong — catch intercepts retryable errors, preventing retry
withRetry(() => skill.run(input).catch((e) => {
  throw new SkillError('skillName', e);
}));
```

---

## 🧪 Testing

### Required test coverage

Every skill must have a corresponding file in `src/skills/__tests__/` verifying:

- Correct output schema for a valid input.
- Graceful empty-state handling (e.g. no cuisines in text → `[]`).
- Deterministic logic for heuristic skills (all weight combinations for `scoreRestaurant`).

### Running tests

```bash
# Skills test suite
npx tsx src/skills/__tests__/scoreRestaurant.test.ts

# Full test suite (includes lib tests)
npm test
```

### `scoreRestaurant` expected test values

The test file (`src/skills/__tests__/scoreRestaurant.test.ts`) covers these cases without `similarity`:

| Test case | Expected `matchScore` |
| :--- | :--- |
| Perfect match (cuisine + price + neighborhood + ambiance + dietary) | `1.0` |
| Cuisine mismatch only | `0.7` |
| Price mismatch only (adjacent tier) | `~0.85` |
| Neighborhood mismatch only | `0.8` |
| Ambiance mismatch only | `0.8` |
| Dietary mismatch only | `~0.9` |

---

## 📁 File Reference

| File | Purpose |
| :--- | :--- |
| `src/skills/types.ts` | `AgentSkill<I,O>` and `SkillContext` interfaces |
| `src/skills/registry.ts` | `registerSkill`, `getSkill`, `listSkills` |
| `src/skills/bootstrap.ts` | Registers all six skills at server startup |
| `src/skills/extractCuisines.ts` | Skill 1 — text cuisine extraction |
| `src/skills/analyzeFoodPhoto.ts` | Skill 2 — vision-based profile enrichment |
| `src/skills/generateEmbedding.ts` | Skill 3 — semantic vector generation |
| `src/skills/scoreRestaurant.ts` | Skill 4 — deterministic heuristic scorer |
| `src/skills/extractTrendsFromSearchResults.ts` | Skill 5 — trend structuring from search |
| `src/skills/classifyTrendRelevanceToProfile.ts` | Skill 6 — profile-trend relevance scoring |
| `src/skills/__tests__/scoreRestaurant.test.ts` | Deterministic scorer test suite |
| `src/services/ragRecommender.ts` | Exports `RestaurantCandidate` type |
| `src/lib/errors.ts` | `SkillError`, `AgentServiceError`, `AppError` |
| `src/lib/utils.ts` | `withRetry`, `cleanJson`, `cn` |
