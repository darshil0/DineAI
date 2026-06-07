# DineAI 🍽️

> **v2.3.0** — AI-powered restaurant recommendations via a multi-agent pipeline built on Google Gemini, Express 5, and React 19.

DineAI orchestrates four specialized AI agents to deliver personalized, real-time dining suggestions. It combines a custom **Express 5 / Node.js** backend, a modular **Agent Skills** architecture, an in-memory vector database for semantic retrieval, **Gemini Structured Outputs** for schema-validated responses, and a **React 19 / Tailwind CSS 4** frontend.

---

## ✨ Features

* **Multi-Agent Orchestration:** A sequential pipeline of four agents (Profile Builder → RAG Recommender → Trend Analyst → Finalizer), each with a single responsibility and independently testable skills.
* **Dynamic Taste Profiles:** Automatically infers preferences from conversation history, photo uploads, and real-time feedback. Profiles evolve with every message.
* **Semantic Search (RAG):** Gemini embeddings + a custom in-memory `LocalVectorDB` power sub-millisecond similarity search across the full restaurant catalog, with heuristic re-ranking via the `scoreRestaurant` skill.
* **Real-Time Trend Analysis:** Google Search grounding surfaces trending cuisines, new openings, and viral dishes, cross-referencing them against the taste profile before recommending.
* **Explainable AI:** Every recommendation carries two rationales: a `whyMatch` heuristic score from `scoreRestaurant` and a narrative `rationale` synthesized by the Finalizer.
* **Multimodal Input:** Upload a food photo (max 5 MB); the `analyzeFoodPhoto` skill infers cuisine types and ambiance to enrich the profile.
* **Interactive Feedback Loop:** Like / Dislike signals are queued as natural-language context and injected into the next prompt, updating `disliked_cuisines` and `avoid_patterns`.
* **Advanced Filtering:** Multi-select filter bar for cuisine, price tier, and neighborhood, applied client-side.
* **Favorites Collection:** Save restaurants to a persistent local collection, accessible from the header.
* **Onboarding Tutorial:** A five-step modal explains the pipeline, taste profiles, and visual input.
* **High Resilience:** All Gemini API calls are wrapped in `withRetry` (3 attempts, exponential backoff). Responses are validated against Zod schemas.

---

## 🏗️ Architecture

DineAI runs as a single Node.js server. In development, Vite middleware proxies frontend requests to the Express API. In production, Express serves the pre-built static assets from `dist/`.

### Agent Skills

Each skill is a composable TypeScript function registered via `bootstrapSkills()`.

| Skill | Model | Purpose |
| :--- | :--- | :--- |
| `extractCuisines` | `gemini-2.0-flash` | Parses cuisine names from text |
| `analyzeFoodPhoto` | `gemini-2.0-flash` | Infers cuisines and ambiance from a photo |
| `generateEmbedding` | `gemini-embedding-2-preview` | Produces 768-dim semantic vectors |
| `scoreRestaurant` | Heuristic | Weighted match score (cuisine 0.4, price 0.3, ambiance 0.2, dietary 0.1) |
| `extractTrendsFromSearchResults` | `gemini-2.0-flash` | Structures raw search snippets into trend data |
| `classifyTrendRelevanceToProfile` | `gemini-2.5-pro-preview-05-06` | Scores trend relevance against the profile |

---

## 🛠️ Technology Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| **Frontend** | React + Tailwind CSS | 19.2.7 / 4.3.0 |
| **Build** | Vite | 8.0.16 |
| **Backend** | Node.js + Express | ≥18.0.0 / 5.2.1 |
| **AI SDK** | `@google/genai` | 2.8.0 |
| **Vector DB** | Custom `LocalVectorDB` | In-memory, persisted to `vector_index.json` |
| **Embedding Cache** | `better-sqlite3` | `embeddings_cache.db` (Keyed by MD5 content hash) |

---

## 🚦 Getting Started

### Prerequisites

* **Node.js** v18.0.0 or higher
* **npm** v9.0.0 or higher
* **Google Gemini API Key** — obtain one from Google AI Studio.

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/darshil0/DineAI.git](https://github.com/darshil0/DineAI.git)
    cd DineAI
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the project root:
    ```env
    GEMINI_API_KEY=your_api_key_here
    PORT=3000
    NODE_ENV=development
    ```

### Running the App

```bash
npm run dev

```

Open **http://localhost:3000** in your browser. The Vite dev server and Express API share this port via middleware.

On first start, if no `vector_index.json` is found, DineAI embeds the full catalog (120 restaurants). Embeddings are cached in `embeddings_cache.db` using a content hash of the restaurant metadata to ensure updates automatically invalidate stale vectors.

---

## 🛠️ Development

### Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `tsx server.ts` | Start backend + Vite dev server |
| `build` | `vite build` | Build production frontend to `dist/` |
| `preview` | `NODE_ENV=production tsx server.ts` | Run the production build locally |
| `lint` | `tsc --noEmit` | Run TypeScript type checking |
| `test` | `npm run test:all` | Run all unit test suites |
| `verify` | `tsx src/scripts/verifySystem.ts` | Full end-to-end system check |

### Key Design Decisions

* **Dual-model strategy:** `gemini-2.0-flash` handles extraction and vision; `gemini-2.5-pro-preview-05-06` is reserved for reasoning-heavy synthesis.
* **RestaurantCandidate type:** `recommendCandidates()` returns `Restaurant & { match_score?: number; whyMatch?: string }`. This ensures the heuristic rationale flows through to the Finalizer.
* **Partial index recovery:** The ingestion guard compares `existingCount >= restaurants.length`. Partially ingested indexes are automatically completed on next startup.
* **Embedding cache:** Vectors are stored via `better-sqlite3`. The cache key is an MD5 hash of the restaurant object, preventing stale embeddings when catalog data changes.
* **History truncation:** Only the last 10 conversation exchanges are forwarded to agents to cap context window costs.

---

## 🔒 Security

* API key is consumed server-side only.
* In development, CORS is restricted to `localhost`. In production, CORS is configured strictly for same-origin requests as the API and frontend share the same domain.
* All incoming payloads are validated with Zod.
* File uploads are capped at 5 MB and restricted to `image/jpeg`, `image/png`, `image/webp`, and `image/gif`.

See `SECURITY.md` for the vulnerability reporting process.

```
