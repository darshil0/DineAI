<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">

# DineAI

**A multi-agent restaurant recommendation chatbot powered by Google Gemini.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)

[View in AI Studio](https://ai.studio/apps/6991651b-a322-44dd-b708-0413e783338e)

</div>

---

DineAI orchestrates four specialized AI agents to deliver personalized, real-time dining suggestions. It combines Retrieval-Augmented Generation (RAG) with Gemini embeddings, multimodal vision analysis, and live Google Search grounding to build a dynamic taste profile for each user — going far beyond static filters or one-size-fits-all recommendations.

## How It Works

Each chat message passes through a four-stage pipeline:

```
User Input
    │
    ▼
┌─────────────────────┐
│  Profile Builder    │  Extracts cuisines, budget, ambiance, and dietary
│  Agent              │  notes from text and optional food photos.
└─────────┬───────────┘
          │
    ┌─────┴──────┐ (parallel)
    ▼            ▼
┌──────────┐  ┌──────────────────┐
│   RAG    │  │  Food Trend      │
│Recommender│  │  Analyst Agent   │
│  Agent   │  │                  │
└──────────┘  └──────────────────┘
    │  Semantic     │  Live Google
    │  search +     │  Search grounding
    │  re-ranking   │  for NYC trends
    └─────┬──────┘
          ▼
┌─────────────────────┐
│  Recommendation     │  Combines candidates + trends into a
│  Finalizer Agent    │  ranked list with natural-language rationale.
└─────────────────────┘
          │
          ▼
    Chat Response
```

## Features

- **Structured taste profiling** — builds a `UserTasteProfile` (cuisines, price range, ambiance, dietary notes, occasions) that refines across turns.
- **Semantic restaurant search** — embeds your profile query with `text-embedding-004` and queries a pre-indexed in-memory vector database using cosine similarity.
- **Hybrid re-ranking** — combines vector similarity with rule-based scoring (cuisine match, price tier, ambiance tags, dietary compatibility) for precise results.
- **Live trend grounding** — the Trend Analyst agent uses Gemini's Google Search tool to surface current NYC food trends, new openings, and viral dishes.
- **Multimodal photo analysis** — upload a food photo and the vision agent infers cuisine type, plating style, and ambiance signals to enrich your profile.
- **Structured outputs** — every agent response is validated against a Gemini `responseSchema`, eliminating unparseable JSON in production.
- **Modular skills registry** — agent capabilities (`extractCuisines`, `generateEmbedding`, `scoreRestaurant`, `analyzeFoodPhoto`) are registered independently and composed at runtime.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2, Tailwind CSS 4, Lucide React, Motion |
| Backend | Node.js (v18+), Express 5.2 |
| AI SDK | `@google/genai` v1.43+ |
| LLM & Vision | `gemini-2.0-flash` |
| Embeddings | `text-embedding-004` |
| Vector DB | Custom in-memory DB (cosine similarity, pre-normalized) |
| Build | Vite 7, TypeScript 5.8 |
| Validation | Zod (API input validation) |

## Getting Started

**Prerequisites:** Node.js v18 or higher.

**1. Clone and install dependencies**

```bash
git clone https://github.com/darshil0/DineAI.git
cd DineAI
npm install
```

**2. Configure your API key**

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set your key:

```
GEMINI_API_KEY="your_gemini_api_key_here"
```

Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

**3. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The server will embed all 120 restaurant records into the vector database on first startup (takes ~30 seconds). Subsequent starts are instant because ingestion is skipped when records already exist.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the server with hot-reload (tsx + Vite middleware) |
| `npm run build` | Build the React frontend for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type-checking with no emit |
| `npm run lint` | Run ESLint across `src/` |
| `npm run clean` | Remove the `dist/` directory |

## Project Structure

```
DineAI/
├── server.ts                  # Express entry point
├── src/
│   ├── api/
│   │   └── chat.ts            # POST /api/chat route
│   ├── components/            # React UI components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── TasteProfileBadge.tsx
│   ├── data/
│   │   └── restaurants.ts     # 120 NYC restaurant records
│   ├── lib/
│   │   ├── geminiClient.ts    # Shared Gemini client + model constant
│   │   ├── logger.ts          # Structured logger ([TIMESTAMP][LEVEL][MODULE])
│   │   ├── utils.ts           # cleanJson helper
│   │   └── vectorDb.ts        # In-memory vector DB (pre-normalized)
│   ├── prompts/
│   │   └── index.ts           # All agent system prompts and prompt builders
│   ├── schemas/
│   │   ├── userTasteProfile.ts
│   │   └── recommendation.ts
│   ├── scripts/
│   │   └── ingestRestaurants.ts  # Startup embedding + ingestion
│   ├── services/
│   │   ├── profileBuilder.ts  # Agent 1
│   │   ├── ragRecommender.ts  # Agent 2
│   │   ├── trendAnalyst.ts    # Agent 3
│   │   └── finalizer.ts       # Agent 4
│   └── skills/
│       ├── analyzeFoodPhoto.ts
│       ├── bootstrap.ts
│       ├── extractCuisines.ts
│       ├── generateEmbedding.ts
│       ├── registry.ts
│       ├── scoreRestaurant.ts
│       └── types.ts
└── .env.local.example
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `APP_URL` | No | Deployment URL (injected automatically in AI Studio) |
| `NODE_ENV` | No | Set to `production` to serve the built frontend instead of Vite middleware |

The server loads `.env.local` first and falls back to `.env`, so local development never requires editing the committed example file.

## Important Notes

**Vector DB lifecycle** — the vector database is in-memory. Restarting the server clears all embedded records. Ingestion runs automatically on startup and is skipped if records already exist, so a clean restart takes ~30 seconds the first time and is instant thereafter. There is no persistent storage between sessions.

**Rate limiting during ingestion** — restaurant embeddings are generated in concurrent batches of 5 with a 200ms delay between batches. If you hit API quota errors during startup, increase the delay in `src/scripts/ingestRestaurants.ts`.

**Express 5 error handling** — this project uses Express 5, which automatically forwards errors thrown in async route handlers to the error middleware. The global error handler is registered at the bottom of `server.ts`.
