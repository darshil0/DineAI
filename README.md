# DineAI 🍽️

> **v2.3.0** — AI-powered restaurant recommendations via a multi-agent pipeline built on Google Gemini, Express 5, and React 19.

DineAI orchestrates four specialized AI agents to deliver personalized, real-time dining suggestions. It combines a custom **Express 5 / Node.js** backend, a modular **Agent Skills** architecture, an in-memory vector database for semantic retrieval, **Gemini Structured Outputs** for schema-validated responses, and a **React 19 / Tailwind CSS 4** frontend — resulting in a production-grade pipeline that is both resilient and explainable.

---

## ✨ Features

- **Multi-Agent Orchestration** — A sequential pipeline of four agents (Profile Builder → RAG Recommender → Trend Analyst → Finalizer), each with a single responsibility and independently testable skills.
- **Dynamic Taste Profiles** — Automatically infers preferences from conversation history, photo uploads, and real-time feedback. Profiles evolve with every message.
- **Semantic Search (RAG)** — Gemini embeddings + a custom in-memory `LocalVectorDB` power sub-millisecond similarity search across the full restaurant catalog, with heuristic re-ranking via the `scoreRestaurant` skill.
- **Real-Time Trend Analysis** — Google Search grounding surfaces trending cuisines, new openings, and viral dishes, then cross-references them against your taste profile before any recommendation is made.
- **Explainable AI** — Every recommendation carries two rationales: a `whyMatch` heuristic score from `scoreRestaurant` and a narrative `rationale` synthesized by the Finalizer — both rendered on the card.
- **Multimodal Input** — Upload a food photo; the `analyzeFoodPhoto` skill infers cuisine types and ambiance to enrich your profile automatically.
- **Interactive Feedback Loop** — Like / Dislike signals are queued as natural-language context and injected into the next prompt, updating `disliked_cuisines` and `avoid_patterns` in real time.
- **Advanced Filtering** — Multi-select filter bar for cuisine, price tier, and neighborhood, applied client-side with no additional API calls.
- **Favorites Collection** — Heart any restaurant to save it to a persistent local collection, accessible from the header at any time.
- **Onboarding Tutorial** — A five-step modal explains the multi-agent pipeline, taste profiles, and visual input on first visit.
- **Voice-to-Text Input** — Hands-free interaction powered by the Web Speech API, allowing users to dictate preferences naturally.
- **Skeleton Loading States** — Shimmer effects for cards and badges provide instant visual feedback and maintain UI stability while background agents process.
- **Premium UI** — Dark mode with "Culinary Gold" accents (`#d4af37`), glassmorphism cards, Playfair Display typography, and Motion-powered transitions throughout.
- **High Resilience** — All Gemini API calls are wrapped in `withRetry` (3 attempts, exponential backoff). All agent responses are validated against Zod schemas before use.

---

## 🧠 Model Selection & Resilience

DineAI employs a tiered model strategy to balance reasoning depth with execution speed:

- **Reasoning Tier (`gemini-1.5-pro`)**: Reserved for high-complexity synthesis tasks (Finalizer), search-grounded trend analysis (Trend Analyst), and fallback RAG filtering.
- **Performance Tier (`gemini-2.0-flash`)**: Used for high-throughput extraction (Profile Builder, `extractCuisines`) and multimodal vision analysis (`analyzeFoodPhoto`).
- **Embedding Tier (`text-embedding-004`)**: Generates semantic vectors for RAG.

### Resilience Contract
Every AI interaction is protected by a multi-layered resilience strategy:
1. **Exponential Backoff**: All calls are wrapped in `withRetry`, specifically targeting `429 Too Many Requests` errors.
2. **Schema Validation**: Outgoing profiles are validated at runtime via `UserTasteProfileZodSchema` to prevent pipeline crashes.
3. **Structured Error Handling**: Failures are wrapped in specialized `SkillError` or `AgentServiceError` classes, providing both technical logs and user-friendly feedback.
4. **Embedding Cache**: `embeddings_cache.db` (SQLite) persists vectors for the restaurant catalog, ensuring zero API cost and instant startup on subsequent runs.

---

## 🏗️ Architecture

DineAI runs as a single Node.js server that serves both the Express API and the Vite dev server (in development) or pre-built static assets (in production).

```
User Request
     │
     ▼
┌─────────────────────┐
│  Profile Builder    │  gemini-2.0-flash
│  extractCuisines    │  gemini-2.0-flash
│  analyzeFoodPhoto   │  gemini-2.0-flash  (if image uploaded)
└────────┬────────────┘
         │ UserTasteProfile
    ┌────┴────┐
    │         │  (parallel)
    ▼         ▼
┌───────┐  ┌──────────────┐
│  RAG  │  │ Trend Analyst│  gemini-1.5-pro
│Recom- │  │ + Google     │  + extractTrendsFromSearchResults (flash)
│mender │  │   Search     │  + classifyTrendRelevanceToProfile (pro)
└───┬───┘  └──────┬───────┘
    │              │
    └──────┬───────┘
           │ candidates + trend report
           ▼
┌─────────────────────┐
│     Finalizer       │  gemini-1.5-pro
│  Top 3–5 ranked     │
│  recommendations    │
└─────────────────────┘
```

### Agent Skills

Each skill is a composable, independently testable TypeScript function registered at startup via `bootstrapSkills()`.

| Skill | Model | Purpose |
|---|---|---|
| `extractCuisines` | `gemini-2.0-flash` | Parses cuisine names from user text |
| `analyzeFoodPhoto` | `gemini-2.0-flash` | Infers cuisines and ambiance from a photo |
| `generateEmbedding` | `text-embedding-004` | Produces semantic vectors for search |
| `scoreRestaurant` | Heuristic | Weighted match score (cuisine 0.4, price 0.3, ambiance 0.2, dietary 0.1) |
| `extractTrendsFromSearchResults` | `gemini-2.0-flash` | Structures raw search snippets into trend data |
| `classifyTrendRelevanceToProfile` | `gemini-1.5-pro` | Scores trend relevance against the user's profile |

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|---|---|---|
| **Frontend** | React + Tailwind CSS | 19.2.7 / 4.3.0 |
| **Build** | Vite | 8.0.16 |
| **Backend** | Node.js + Express | ≥18.0.0 / 5.2.1 |
| **AI SDK** | `@google/genai` | 2.8.0 |
| **Performance Tier** | `gemini-2.0-flash` | Text, vision, extraction |
| **Reasoning Tier** | `gemini-1.5-pro` | Synthesis, trend classification |
| **Embeddings** | `text-embedding-004` | Semantic vectors |
| **Vector DB** | Custom `LocalVectorDB` | In-memory, persisted to `vector_index.json` |
| **Embedding Cache** | `better-sqlite3` | `embeddings_cache.db` — zero API cost on restart |
| **Validation** | Zod | 4.4.3 |
| **Animation** | Motion | 12.40.0 |
| **Icons** | Lucide React | 1.17.0 |
| **TypeScript** | TypeScript | 5.9.3 |
| **File Uploads** | Multer | 2.1.1 |
| **Markdown Rendering** | react-markdown + remark-gfm | 10.1.0 / 4.0.1 |

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Google Gemini API Key** — obtain one from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/darshil0/DineAI.git
   cd DineAI
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   NODE_ENV=development
   ```
   See `.env.example` for all available options.

### Running the App

```bash
npm run dev
```

This single command starts the Express backend and the Vite dev server together. Open **http://localhost:5173** for the frontend; the Express API itself is available at **http://localhost:3000**. In production (`npm run build` followed by `npm start`), Express serves the pre-built static assets directly, and both frontend and API are reachable from the same port.

On first start, if no `vector_index.json` is found, DineAI automatically embeds the full restaurant catalog (120 restaurants). Embeddings are cached in `embeddings_cache.db` so subsequent restarts are instant.

---

## 🛠️ Development

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx server.ts` | Start backend + Vite dev server |
| `start` | `tsx server.ts` | Start server in production mode |
| `build` | `vite build` | Build production frontend to `dist/` |
| `preview` | `vite preview` | Preview the production build locally |
| `lint` | `tsc --noEmit` | Run TypeScript type checking |
| `test` | see below | Run all unit test suites |
| `verify` | `tsx src/scripts/verifySystem.ts` | Full end-to-end system check |
| `clean` | `rm -rf dist` | Remove build output |

The `test` script runs three suites in sequence, executed directly with `tsx` (no separate test runner is used):
```bash
npx tsx src/lib/__tests__/utils.test.ts
npx tsx src/lib/__tests__/vectorDb.test.ts
npx tsx src/skills/__tests__/scoreRestaurant.test.ts
```

### Project Structure

```
DineAI/
├── server.ts                     # Express 5 entry point + Vite middleware
├── src/
│   ├── api/
│   │   └── chat.ts               # POST /api/chat — orchestrates the full pipeline
│   ├── components/
│   │   ├── ChatInterface.tsx      # Main shell: state, input, history, favorites
│   │   ├── ChatMessage.tsx        # Markdown-rendered message bubbles
│   │   ├── FilterControls.tsx     # Multi-select cuisine / price / neighborhood bar
│   │   ├── OnboardingTutorial.tsx # First-visit five-step modal
│   │   ├── RecommendationCard.tsx # Card with heuristic + narrative rationale
│   │   └── TasteProfileBadge.tsx  # Live taste profile display
│   ├── data/
│   │   └── restaurants.ts         # 120-restaurant knowledge base with full metadata
│   ├── lib/
│   │   ├── cache.ts               # SQLite-backed embedding cache
│   │   ├── errors.ts              # AppError / AgentServiceError / SkillError / ValidationError
│   │   ├── geminiClient.ts        # Singleton GoogleGenAI client
│   │   ├── utils.ts               # cleanJson, withRetry (exponential backoff), cn
│   │   ├── vectorDb.ts            # LocalVectorDB: upsert, cosine query, JSON persistence
│   │   └── __tests__/             # utils.test.ts, vectorDb.test.ts
│   ├── prompts/
│   │   └── index.ts               # All system prompts and prompt-builder functions
│   ├── schemas/
│   │   ├── recommendation.ts      # Recommendation interface + FinalRecommendationsSchema
│   │   └── userTasteProfile.ts    # UserTasteProfile interface + UserTasteProfileSchema
│   ├── scripts/
│   │   ├── ingestRestaurants.ts   # Batch-embed catalog → VectorDB + cache
│   │   └── verifySystem.ts        # End-to-end smoke test
│   ├── services/
│   │   ├── profileBuilder.ts      # Profile Builder Agent
│   │   ├── ragRecommender.ts      # RAG Recommender Agent (exports RestaurantCandidate)
│   │   ├── trendAnalyst.ts        # Food Trend Analyst Agent
│   │   └── finalizer.ts           # Recommendation Finalizer Agent
│   └── skills/
│       ├── analyzeFoodPhoto.ts
│       ├── bootstrap.ts           # Registers all skills into the registry
│       ├── classifyTrendRelevanceToProfile.ts
│       ├── extractCuisines.ts
│       ├── extractTrendsFromSearchResults.ts
│       ├── generateEmbedding.ts
│       ├── registry.ts            # registerSkill / getSkill / listSkills
│       ├── scoreRestaurant.ts     # Deterministic heuristic scorer
│       ├── types.ts               # AgentSkill<I,O> interface
│       └── __tests__/
│           └── scoreRestaurant.test.ts
├── .env.example
├── AGENTS.md                      # Multi-agent architecture and reliability standards
├── CHANGELOG.md
├── CONTRIBUTING.md
├── DESIGN.md                      # System design and philosophy
├── SECURITY.md
├── SKILLS.md                      # Agent skills technical specification
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Key Design Decisions

**Dual-model strategy** — `gemini-2.0-flash` handles extraction and vision tasks where throughput matters; `gemini-1.5-pro` is reserved for reasoning-heavy synthesis (Finalizer, trend classification, RAG fallback) where output quality is the priority.

**`RestaurantCandidate` type** — `recommendCandidates()` returns `Restaurant & { match_score?: number; whyMatch?: string }` rather than bare `Restaurant[]`. This ensures the heuristic rationale computed by `scoreRestaurant` flows through to the Finalizer's prompt and is rendered on every recommendation card.

**Partial index recovery** — The ingestion guard compares `existingCount >= restaurants.length` rather than `existingCount > 0`, so a partially ingested vector index (e.g., from a previous interrupted run) is automatically completed on next startup rather than silently producing degraded results.

**Embedding cache** — `embeddings_cache.db` (SQLite via `better-sqlite3`) stores pre-computed vectors keyed by `name-neighborhood`. The full 120-restaurant catalog only incurs API costs on the very first cold start.

**History truncation** — Only the last 10 conversation exchanges are forwarded to any agent, capping context window costs and reducing PII exposure.

---

## 🔒 Security

- API key is consumed server-side only — never exposed to the browser.
- CORS is restricted to `localhost` origins only; `GET` and `POST` methods only.
- All incoming payloads are validated with Zod before entering the agent pipeline.
- Conversation history is truncated to 10 exchanges to limit PII persistence.
- File uploads are capped at 5 MB and restricted to `image/jpeg`, `image/png`, `image/webp`, and `image/gif`.

See [SECURITY.md](./SECURITY.md) for the vulnerability reporting process.

---

## 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request — it covers branching conventions, the `withRetry` / `SkillError` resilience contract, and the test requirements that must pass before merging.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).
